import { layoutNextLine, prepareWithSegments, type LayoutCursor, type PreparedTextWithSegments } from '@chenglou/pretext';

type Interval = {
    left: number;
    right: number;
};

type PositionedLine = {
    x: number;
    y: number;
    text: string;
};

const DEMO_TEXT = `This mini editorial layout is computed with Pretext. Gengar moves, and each text line is routed around it without DOM reads in the hot path. As the sprite moves, line slots are recomputed and the copy flows around the blocked area in real time.

This is the value of deterministic text layout: UI logic can own line placement when interaction gets weird, while still keeping frame times predictable.`;

const FONT_FAMILY = '"JetBrains Mono", monospace';
const FONT_SIZE = 16;
const FONT_WEIGHT = 300;
const LINE_HEIGHT = 28;
const DEMO_FONT = `${FONT_WEIGHT} ${FONT_SIZE}px ${FONT_FAMILY}`;
const PAD = 20;
const COL_GAP = 24;
const MIN_SLOT_WIDTH = 90;
const SPRITE_SCALE = 2;

const WALK_SHEET_SRC = '/assets/blog/pretext-demo/gengar-Walk-Anim.png';
const ANIM_DATA_SRC = '/assets/blog/pretext-demo/gengar-AnimData.xml';

type SpriteSheetConfig = {
    src: string;
    frameW: number;
    frameH: number;
    cols: number;
    rows: number;
    walkFps: number;
    idleFps: number;
    walkFrames: number[];
    idleFrames: number[];
    scale: number;
};

const DEFAULT_SPRITE_SHEET: SpriteSheetConfig = {
    src: WALK_SHEET_SRC,
    frameW: 32,
    frameH: 40,
    cols: 4,
    rows: 8,
    walkFps: 12,
    idleFps: 7,
    walkFrames: [0, 1, 2, 3],
    idleFrames: [0, 1, 2, 1],
    scale: SPRITE_SCALE
};

const RELAYOUT_MIN_INTERVAL_MS = 33;

const WALK_START_DISTANCE = 55;
const WALK_STOP_DISTANCE = 42;
const SLEEP_AFTER_IDLE_MS = 6000;
const SLEEP_BOB_AMPLITUDE = 2.5;
const CHASE_SPEED = (4 / 33) * 1000;

type MotionState = 'walk' | 'idle' | 'sleep';

type AnimMeta = {
    frameWidth: number;
    frameHeight: number;
    durations: number[];
};

type DemoState = {
    gengar: {
        x: number;
        y: number;
        r: number;
        speed: number;
        rotation: number;
        motion: MotionState;
        frame: number;
        frameTimer: number;
    };
    pointer: {
        x: number;
        y: number;
        lastMoveAt: number;
    };
    prepared: PreparedTextWithSegments;
    lastFrameTime: number;
    lastRelayoutTime: number;
    rafId: number | null;
    resizeObserver: ResizeObserver | null;
    stageEl: HTMLDivElement;
    linesEl: HTMLDivElement;
    spriteEl: HTMLDivElement;
    spriteInnerEl: HTMLDivElement;
    spriteSheet: SpriteSheetConfig;
};

function parsePositiveInt(value: string | null): number | null {
    if (value === null) return null;
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function getDefaultSpriteSheet(): SpriteSheetConfig {
    return {
        ...DEFAULT_SPRITE_SHEET,
        walkFrames: [...DEFAULT_SPRITE_SHEET.walkFrames],
        idleFrames: [...DEFAULT_SPRITE_SHEET.idleFrames]
    };
}

function getAnimMeta(doc: XMLDocument, name: string): AnimMeta | null {
    const animNodes = Array.from(doc.getElementsByTagName('Anim'));

    for (let i = 0; i < animNodes.length; i++) {
        const anim = animNodes[i]!;
        const animName = anim.getElementsByTagName('Name').item(0)?.textContent?.trim();
        if (animName !== name) continue;

        const frameWidth = parsePositiveInt(anim.getElementsByTagName('FrameWidth').item(0)?.textContent ?? null);
        const frameHeight = parsePositiveInt(anim.getElementsByTagName('FrameHeight').item(0)?.textContent ?? null);
        if (!frameWidth || !frameHeight) return null;

        const durationNodes = Array.from(anim.getElementsByTagName('Duration'));
        const durations = durationNodes
            .map((node) => parsePositiveInt(node.textContent))
            .filter((duration): duration is number => duration !== null);

        return {
            frameWidth,
            frameHeight,
            durations
        };
    }

    return null;
}

function durationsToFps(durations: number[], fallback: number): number {
    if (durations.length === 0) return fallback;
    const total = durations.reduce((sum, duration) => sum + duration, 0);
    const average = total / durations.length;
    if (!Number.isFinite(average) || average <= 0) return fallback;
    return Math.max(3, Math.min(18, 60 / average));
}

function buildIdleFrames(frameCount: number): number[] {
    if (frameCount <= 1) return [0];

    const frames: number[] = [];
    for (let i = 0; i < frameCount; i++) {
        frames.push(i);
    }
    for (let i = frameCount - 2; i > 0; i--) {
        frames.push(i);
    }

    return frames;
}

function readImageDimensions(src: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
        image.onerror = () => reject(new Error(`Unable to load sprite sheet: ${src}`));
        image.src = src;
    });
}

async function loadSpriteSheetFromAnimData(): Promise<SpriteSheetConfig> {
    const fallback = getDefaultSpriteSheet();

    try {
        const [xmlText, image] = await Promise.all([
            fetch(ANIM_DATA_SRC).then(async (response) => {
                if (!response.ok) {
                    throw new Error(`Unable to fetch animation data: ${response.status}`);
                }
                return response.text();
            }),
            readImageDimensions(WALK_SHEET_SRC)
        ]);

        const xml = new DOMParser().parseFromString(xmlText, 'application/xml');
        if (xml.querySelector('parsererror')) {
            throw new Error('Animation XML parse error');
        }

        const walk = getAnimMeta(xml, 'Walk');
        const idle = getAnimMeta(xml, 'Idle');
        const sleep = getAnimMeta(xml, 'Sleep');
        const base = walk ?? idle ?? sleep;
        if (!base) return fallback;

        const cols = Math.max(1, Math.floor(image.width / base.frameWidth));
        const rows = Math.max(1, Math.floor(image.height / base.frameHeight));
        const walkFrameCount = Math.max(1, Math.min(cols, walk?.durations.length ?? cols));
        const idleFrameCount = Math.max(1, Math.min(cols, idle?.durations.length ?? walkFrameCount));

        return {
            src: WALK_SHEET_SRC,
            frameW: base.frameWidth,
            frameH: base.frameHeight,
            cols,
            rows,
            walkFps: durationsToFps(walk?.durations ?? [], fallback.walkFps),
            idleFps: durationsToFps(idle?.durations ?? sleep?.durations ?? [], fallback.idleFps),
            walkFrames: Array.from({ length: walkFrameCount }, (_, index) => index),
            idleFrames: buildIdleFrames(idleFrameCount),
            scale: SPRITE_SCALE
        };
    } catch {
        return fallback;
    }
}

function frameX(frame: number, cols: number): number {
    return frame % cols;
}

function angle360(cx: number, cy: number, ex: number, ey: number): number {
    const theta = Math.atan2(ey - cy, ex - cx) * (180 / Math.PI);
    return theta < 0 ? theta + 360 : theta;
}

function rotationFromAngle(angle: number): number {
    if (angle >= 67.5 && angle < 112.5) return 0;
    if (angle >= 22.5 && angle < 67.5) return 1;
    if (angle >= 337.5 || angle < 22.5) return 2;
    if (angle >= 292.5 && angle < 337.5) return 3;
    if (angle >= 247.5 && angle < 292.5) return 4;
    if (angle >= 202.5 && angle < 247.5) return 5;
    if (angle >= 157.5 && angle < 202.5) return 6;
    return 7;
}

function escapeHtml(text: string): string {
    return text
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function renderLinesHtml(items: PositionedLine[]): string {
    return items
        .map((line) => {
            const text = escapeHtml(line.text);
            return `<span class="absolute whitespace-pre" style="left:${line.x}px; top:${line.y}px; font-family:${FONT_FAMILY}; font-size:${FONT_SIZE}px; line-height:${LINE_HEIGHT}px; font-weight:${FONT_WEIGHT}; color:var(--color-uv-text-dim, #d8b4fe); opacity:0.8;">${text}</span>`;
        })
        .join('');
}

function blockedIntervalForBand(
    cx: number,
    cy: number,
    r: number,
    bandTop: number,
    bandBottom: number,
    hPad: number,
    vPad: number
): Interval | null {
    const nearestY = Math.min(Math.max(cy, bandTop), bandBottom);
    const effectiveR = r + vPad;
    const dy = nearestY - cy;
    if (Math.abs(dy) >= effectiveR) return null;

    const dx = Math.sqrt(effectiveR * effectiveR - dy * dy);
    return {
        left: cx - dx - hPad,
        right: cx + dx + hPad
    };
}

function carveSlots(base: Interval, blocked: Interval[]): Interval[] {
    if (blocked.length === 0) return [base];

    const clamped = blocked
        .map((it) => ({ left: Math.max(base.left, it.left), right: Math.min(base.right, it.right) }))
        .filter((it) => it.right > it.left)
        .sort((a, b) => a.left - b.left);

    if (clamped.length === 0) return [base];

    const merged: Interval[] = [];
    for (let i = 0; i < clamped.length; i++) {
        const current = clamped[i]!;
        const last = merged[merged.length - 1];
        if (!last || current.left > last.right) {
            merged.push({ ...current });
        } else {
            last.right = Math.max(last.right, current.right);
        }
    }

    const slots: Interval[] = [];
    let cursor = base.left;
    for (let i = 0; i < merged.length; i++) {
        const blockedRange = merged[i]!;
        if (blockedRange.left > cursor) {
            slots.push({ left: cursor, right: blockedRange.left });
        }
        cursor = Math.max(cursor, blockedRange.right);
    }

    if (cursor < base.right) {
        slots.push({ left: cursor, right: base.right });
    }

    return slots;
}

function widestSlot(slots: Interval[]): Interval | null {
    let best: Interval | null = null;
    let bestWidth = -1;

    for (let i = 0; i < slots.length; i++) {
        const slot = slots[i]!;
        const width = slot.right - slot.left;
        if (width < MIN_SLOT_WIDTH) continue;
        if (width > bestWidth) {
            best = slot;
            bestWidth = width;
        }
    }

    return best;
}

function clampgengar(state: DemoState, width: number, height: number): void {
    state.gengar.x = Math.max(state.gengar.r + 8, Math.min(width - state.gengar.r - 8, state.gengar.x));
    state.gengar.y = Math.max(state.gengar.r + 8, Math.min(height - state.gengar.r - 8, state.gengar.y));
}

function computeLines(state: DemoState, width: number, height: number): PositionedLine[] {
    const paddedW = Math.max(1, width - PAD * 2);
    const paddedH = Math.max(1, height - PAD * 2);
    const colCount = paddedW > 760 ? 2 : 1;
    const colW = Math.floor((paddedW - (colCount - 1) * COL_GAP) / colCount);

    const result: PositionedLine[] = [];
    let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 };

    for (let col = 0; col < colCount; col++) {
        const left = PAD + col * (colW + COL_GAP);
        const right = left + colW;
        const top = PAD + 6;
        const bottom = PAD + paddedH - 6;

        let y = top;
        while (y + LINE_HEIGHT <= bottom) {
            const blocked = blockedIntervalForBand(
                state.gengar.x,
                state.gengar.y,
                state.gengar.r,
                y,
                y + LINE_HEIGHT,
                12,
                6
            );
            const slots = carveSlots({ left, right }, blocked ? [blocked] : []);
            const slot = widestSlot(slots);

            if (!slot) {
                y += LINE_HEIGHT;
                continue;
            }

            const line = layoutNextLine(state.prepared, cursor, Math.max(1, slot.right - slot.left));
            if (line === null) return result;

            result.push({ x: slot.left, y, text: line.text });
            cursor = line.end;
            y += LINE_HEIGHT;
        }
    }

    return result;
}

function updateProjectedLines(state: DemoState, width: number, height: number): void {
    const lines = computeLines(state, width, height);
    state.linesEl.innerHTML = renderLinesHtml(lines);
}

function updateSpriteDom(state: DemoState, now: number): void {
    const isWalking = state.gengar.motion === 'walk';
    const sheet = state.spriteSheet;
    const spriteW = sheet.frameW * sheet.scale;
    const spriteH = sheet.frameH * sheet.scale;
    const rotation = Math.max(0, Math.min(sheet.rows - 1, state.gengar.rotation));
    const cycle = isWalking ? sheet.walkFrames : sheet.idleFrames;
    const frame = cycle[state.gengar.frame] ?? cycle[0];
    const bobOffset =
        state.gengar.motion === 'sleep' ? Math.round(Math.sin(now / 240) * SLEEP_BOB_AMPLITUDE) : 0;
    const left = Math.round(state.gengar.x - spriteW / 2);
    const top = Math.round(state.gengar.y - spriteH / 2);
    const bgX = Math.round(-frameX(frame, sheet.cols) * spriteW);
    const bgY = Math.round(-rotation * spriteH);

    state.spriteEl.style.left = `${left}px`;
    state.spriteEl.style.top = `${top}px`;
    state.spriteEl.style.width = `${spriteW}px`;
    state.spriteEl.style.height = `${spriteH}px`;
    state.spriteEl.style.transform = bobOffset === 0 ? 'translateZ(0)' : `translate3d(0, ${bobOffset}px, 0)`;

    state.spriteInnerEl.style.backgroundImage = `url(${sheet.src})`;
    state.spriteInnerEl.style.backgroundSize = `${sheet.cols * spriteW}px ${sheet.rows * spriteH}px`;
    state.spriteInnerEl.style.backgroundPosition = `${bgX}px ${bgY}px`;
    state.spriteInnerEl.style.imageRendering = 'pixelated';
    state.spriteInnerEl.style.transform = 'none';
}

function tick(state: DemoState, now: number): void {
    const dt = state.lastFrameTime === 0 ? 0 : Math.min((now - state.lastFrameTime) / 1000, 0.05);
    state.lastFrameTime = now;

    const width = state.stageEl.clientWidth;
    const height = state.stageEl.clientHeight;

    const targetX = Math.max(state.gengar.r + 8, Math.min(width - state.gengar.r - 8, state.pointer.x));
    const targetY = Math.max(state.gengar.r + 8, Math.min(height - state.gengar.r - 8, state.pointer.y));
    const dx = targetX - state.gengar.x;
    const dy = targetY - state.gengar.y;
    const dist = Math.hypot(dx, dy);
    const angle = angle360(state.gengar.x, state.gengar.y, targetX, targetY);

    state.gengar.rotation = rotationFromAngle(angle);

    const pointerIdleDuration = now - state.pointer.lastMoveAt;
    let nextMotion: MotionState = state.gengar.motion;
    if (state.gengar.motion === 'walk') {
        if (dist < WALK_STOP_DISTANCE) {
            nextMotion = pointerIdleDuration >= SLEEP_AFTER_IDLE_MS ? 'sleep' : 'idle';
        }
    } else if (dist >= WALK_START_DISTANCE) {
        nextMotion = 'walk';
    } else {
        nextMotion = pointerIdleDuration >= SLEEP_AFTER_IDLE_MS ? 'sleep' : 'idle';
    }

    if (nextMotion !== state.gengar.motion) {
        state.gengar.motion = nextMotion;
        state.gengar.frame = 0;
        state.gengar.frameTimer = 0;
    }

    if (state.gengar.motion === 'walk' && dt > 0) {
        const step = Math.min(dist, state.gengar.speed * dt);
        if (dist > 0) {
            const nx = dx / dist;
            const ny = dy / dist;
            state.gengar.x += nx * step;
            state.gengar.y += ny * step;
        }
    }

    clampgengar(state, width, height);

    if (state.gengar.motion === 'walk') {
        state.gengar.frameTimer += dt * state.spriteSheet.walkFps;
        if (state.gengar.frameTimer >= 1) {
            const frameStep = Math.floor(state.gengar.frameTimer);
            state.gengar.frame = (state.gengar.frame + frameStep) % state.spriteSheet.walkFrames.length;
            state.gengar.frameTimer -= frameStep;
        }
    } else if (state.gengar.motion === 'idle') {
        state.gengar.frameTimer += dt * state.spriteSheet.idleFps;
        if (state.gengar.frameTimer >= 1) {
            const frameStep = Math.floor(state.gengar.frameTimer);
            state.gengar.frame = (state.gengar.frame + frameStep) % state.spriteSheet.idleFrames.length;
            state.gengar.frameTimer -= frameStep;
        }
    } else {
        state.gengar.frame = 0;
        state.gengar.frameTimer = 0;
    }

    if (now - state.lastRelayoutTime >= RELAYOUT_MIN_INTERVAL_MS) {
        updateProjectedLines(state, width, height);
        state.lastRelayoutTime = now;
    }
    updateSpriteDom(state, now);
    state.rafId = requestAnimationFrame((nextNow) => tick(state, nextNow));
}

export function mountPretextgengarDemo(
    stageId: string,
    linesId: string,
    spriteId: string,
    spriteInnerId: string
): () => void {
    const stageEl = document.getElementById(stageId) as HTMLDivElement | null;
    const linesEl = document.getElementById(linesId) as HTMLDivElement | null;
    const spriteEl = document.getElementById(spriteId) as HTMLDivElement | null;
    const spriteInnerEl = document.getElementById(spriteInnerId) as HTMLDivElement | null;

    if (!stageEl || !linesEl || !spriteEl || !spriteInnerEl) {
        return () => { };
    }

    const setPointerTarget = (clientX: number, clientY: number): void => {
        const rect = stageEl.getBoundingClientRect();
        state.pointer.x = clientX - rect.left;
        state.pointer.y = clientY - rect.top;
        state.pointer.lastMoveAt = performance.now();
    };

    const onPointerMove = (event: PointerEvent): void => {
        setPointerTarget(event.clientX, event.clientY);
    };

    const onTouchMove = (event: TouchEvent): void => {
        const touch = event.touches.item(0);
        if (!touch) return;
        setPointerTarget(touch.clientX, touch.clientY);
    };

    const spriteSheet = getDefaultSpriteSheet();

    const state: DemoState = {
        gengar: {
            x: 160,
            y: 140,
            r: (Math.max(spriteSheet.frameW, spriteSheet.frameH) * spriteSheet.scale) / 2,
            speed: CHASE_SPEED,
            rotation: 2,
            motion: 'idle',
            frame: 0,
            frameTimer: 0
        },
        pointer: { x: 160, y: 140, lastMoveAt: 0 },
        prepared: prepareWithSegments(DEMO_TEXT, DEMO_FONT),
        lastFrameTime: 0,
        lastRelayoutTime: 0,
        rafId: null,
        resizeObserver: null,
        stageEl,
        linesEl,
        spriteEl,
        spriteInnerEl,
        spriteSheet
    };

    let disposed = false;

    state.gengar.x = stageEl.clientWidth * 0.58;
    state.gengar.y = stageEl.clientHeight * 0.44;
    state.pointer.x = state.gengar.x;
    state.pointer.y = state.gengar.y;
    state.pointer.lastMoveAt = performance.now();
    clampgengar(state, stageEl.clientWidth, stageEl.clientHeight);
    updateProjectedLines(state, stageEl.clientWidth, stageEl.clientHeight);
    updateSpriteDom(state, performance.now());

    void loadSpriteSheetFromAnimData().then((nextSheet) => {
        if (disposed) return;
        state.spriteSheet = nextSheet;
        state.gengar.r = (Math.max(nextSheet.frameW, nextSheet.frameH) * nextSheet.scale) / 2;
        clampgengar(state, stageEl.clientWidth, stageEl.clientHeight);
        updateProjectedLines(state, stageEl.clientWidth, stageEl.clientHeight);
        updateSpriteDom(state, performance.now());
    });

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    state.resizeObserver = new ResizeObserver(() => {
        clampgengar(state, stageEl.clientWidth, stageEl.clientHeight);
        updateProjectedLines(state, stageEl.clientWidth, stageEl.clientHeight);
        updateSpriteDom(state, performance.now());
    });
    state.resizeObserver.observe(stageEl);

    state.rafId = requestAnimationFrame((now) => tick(state, now));

    return () => {
        disposed = true;
        if (state.rafId !== null) {
            cancelAnimationFrame(state.rafId);
        }
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('touchmove', onTouchMove);
        state.resizeObserver?.disconnect();
    };
}
