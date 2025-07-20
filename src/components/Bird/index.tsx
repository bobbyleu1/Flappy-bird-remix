import React from 'react';
import { Image, TouchableWithoutFeedback } from 'react-native';
import Matter from 'matter-js';
import { styles } from './styles';
import BIRD from '../../assets/images/bird.png';

type BirdProps = {
  body: Matter.Body;
  color: string;
  dispatch?: (event: { type: string }) => void;
};

const Bird = ({ body, color, dispatch }: BirdProps) => {
  const widthBody = body.bounds.max.x - body.bounds.min.x;
  const heightBody = body.bounds.max.y - body.bounds.min.y;

  const xBody = body.position.x - widthBody / 2;
  const yBody = body.position.y - heightBody / 2;

  const handleFlap = () => {
    if (dispatch) {
      // Dispatch the 'flap' event when the bird is tapped
      dispatch({ type: 'flap' });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleFlap}>
      <Image
        source={BIRD}
        style={styles({
          widthBody,
          heightBody,
          xBody,
          yBody,
          color,
        }).bird}
      />
    </TouchableWithoutFeedback>
  );
};

export default (
  world: Matter.World,
  color: string,
  pos: { x: number; y: number },
  size: { width: number; height: number },
  dispatch?: (event: { type: string }) => void // This dispatch is passed to the entity creator
) => {
  const initialBird = Matter.Bodies.rectangle(
    pos.x,
    pos.y,
    size.width,
    size.height,
    { label: 'Bird' }
  );

  Matter.World.add(world, [initialBird]);

  return {
    body: initialBird,
    color,
    pos,
    dispatch, // This dispatch is now part of the entity's properties
    // FIX: The renderer should be a function that receives the entity's properties
    // and then passes them as props to the Bird component.
    renderer: (props: BirdProps) => <Bird {...props} />,
  };
};
