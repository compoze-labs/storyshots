import React from 'react';
import './egg.css';

interface EggProps {
   color?: string;
   height?: string;
}

export const Egg = ({
   color,
   height = '210px',
}: EggProps) =>
   <div
      className="egg"
      style={{
         '--egg-color': color,
         '--egg-height': height,
      } as React.CSSProperties}
      role="img"
      aria-label="Egg"
   ></div>