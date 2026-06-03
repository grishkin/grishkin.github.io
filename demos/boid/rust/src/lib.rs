use wasm_bindgen::prelude::*;

const SPEED: f32 = 2.0;
const VISUAL_RANGE: f32 = 75.0;
const SEPARATION_DIST: f32 = 25.0;
const COHERENCE: f32 = 0.005;
const ALIGNMENT: f32 = 0.05;
const SEPARATION: f32 = 0.05;
const MARGIN: f32 = 50.0;
const TURN_FACTOR: f32 = 0.2;

#[wasm_bindgen]
pub struct World {
    width: f32,
    height: f32,
    count: usize,
    x: Vec<f32>,
    y: Vec<f32>,
    vx: Vec<f32>,
    vy: Vec<f32>,
}

#[wasm_bindgen]
impl World {
    pub fn new(width: f32, height: f32, count: usize) -> World {
        let mut x = Vec::with_capacity(count);
        let mut y = Vec::with_capacity(count);
        let mut vx = Vec::with_capacity(count);
        let mut vy = Vec::with_capacity(count);

        for _ in 0..count {
            x.push(js_sys::Math::random() as f32 * width);
            y.push(js_sys::Math::random() as f32 * height);
            let angle = js_sys::Math::random() as f32 * std::f32::consts::TAU;
            vx.push(angle.cos() * SPEED);
            vy.push(angle.sin() * SPEED);
        }

        World { width, height, count, x, y, vx, vy }
    }

    pub fn tick(&mut self) {
        for i in 0..self.count {
            let mut close_dx: f32 = 0.0;
            let mut close_dy: f32 = 0.0;
            let mut avg_vx: f32 = 0.0;
            let mut avg_vy: f32 = 0.0;
            let mut avg_x: f32 = 0.0;
            let mut avg_y: f32 = 0.0;
            let mut neighbors: f32 = 0.0;

            for j in 0..self.count {
                if i == j {
                    continue;
                }
                let dx = self.x[j] - self.x[i];
                let dy = self.y[j] - self.y[i];
                let dist = (dx * dx + dy * dy).sqrt();

                if dist < VISUAL_RANGE {
                    if dist < SEPARATION_DIST {
                        close_dx -= dx;
                        close_dy -= dy;
                    }
                    avg_vx += self.vx[j];
                    avg_vy += self.vy[j];
                    avg_x += self.x[j];
                    avg_y += self.y[j];
                    neighbors += 1.0;
                }
            }

            if neighbors > 0.0 {
                avg_vx /= neighbors;
                avg_vy /= neighbors;
                avg_x /= neighbors;
                avg_y /= neighbors;

                self.vx[i] += (avg_vx - self.vx[i]) * ALIGNMENT;
                self.vy[i] += (avg_vy - self.vy[i]) * ALIGNMENT;
                self.vx[i] += (avg_x - self.x[i]) * COHERENCE;
                self.vy[i] += (avg_y - self.y[i]) * COHERENCE;
            }

            self.vx[i] += close_dx * SEPARATION;
            self.vy[i] += close_dy * SEPARATION;

            // Edge avoidance
            if self.x[i] < MARGIN {
                self.vx[i] += TURN_FACTOR;
            }
            if self.x[i] > self.width - MARGIN {
                self.vx[i] -= TURN_FACTOR;
            }
            if self.y[i] < MARGIN {
                self.vy[i] += TURN_FACTOR;
            }
            if self.y[i] > self.height - MARGIN {
                self.vy[i] -= TURN_FACTOR;
            }

            // Clamp speed
            let speed = (self.vx[i] * self.vx[i] + self.vy[i] * self.vy[i]).sqrt();
            if speed > SPEED {
                self.vx[i] = (self.vx[i] / speed) * SPEED;
                self.vy[i] = (self.vy[i] / speed) * SPEED;
            }

            self.x[i] += self.vx[i];
            self.y[i] += self.vy[i];
        }
    }

    /// Returns interleaved [x0, y0, x1, y1, ...] positions as a Float32Array.
    pub fn positions(&self) -> Vec<f32> {
        let mut out = Vec::with_capacity(self.count * 2);
        for i in 0..self.count {
            out.push(self.x[i]);
            out.push(self.y[i]);
        }
        out
    }
}
