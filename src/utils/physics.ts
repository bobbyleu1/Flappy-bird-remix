import { Dimensions } from 'react-native';
import Matter from 'matter-js';
import { getPipeSizePosPair } from './ramdom';

const windowWidth = Dimensions.get('window').width;
const PIPE_VELOCITY = -3;
const FLAP_FORCE = -4;

let collisionFired = false;

export const Physics = (entities, { touches, time, dispatch }) => {
  const { engine } = entities.physics;
  const bird = entities.Bird.body;

  // 🐦 Handle flap
  touches
    .filter(t => t.type === 'press')
    .forEach(() => {
      Matter.Body.setVelocity(bird, { x: 0, y: FLAP_FORCE });
      dispatch({ type: 'flap' });
    });

  // ♻️ Move and recycle pipes
  for (let i = 1; i <= 2; i++) {
    const top = entities[`ObstacleTop${i}`];
    const bottom = entities[`ObstacleBottom${i}`];

    if (top.body.bounds.max.x <= 0) {
      const newPos = getPipeSizePosPair(windowWidth * 0.9);
      Matter.Body.setPosition(top.body, newPos.pipeTop.pos);
      Matter.Body.setPosition(bottom.body, newPos.pipeBottom.pos);
      top.passed = false;
    }

    Matter.Body.translate(top.body, { x: PIPE_VELOCITY, y: 0 });
    Matter.Body.translate(bottom.body, { x: PIPE_VELOCITY, y: 0 });

    // 🧠 Score logic
    const pipeCenter = top.body.position.x + (top.body.bounds.max.x - top.body.bounds.min.x) / 2;
    if (!top.passed && pipeCenter < bird.position.x) {
      top.passed = true;
      dispatch({ type: 'score' });
    }
  }

  // ☠️ Collision detection (runs every frame but triggers only once)
  Matter.Events.on(engine, 'collisionStart', (event) => {
    if (collisionFired) return;

    for (let pair of event.pairs) {
      const { bodyA, bodyB } = pair;
      const labels = [bodyA.label, bodyB.label];

      if (
        labels.includes('Bird') &&
        (labels.some(l => l.includes('Obstacle')) || labels.includes('Floor'))
      ) {
        collisionFired = true;
        dispatch({ type: 'game_over' });
        break;
      }
    }
  });

  Matter.Engine.update(engine, time.delta);
  return entities;
};

// 🔄 Call this on game reset to allow future collisions
export const resetCollisionFlag = () => {
  collisionFired = false;
};
