import PropTypes from 'prop-types';
import React, { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';

import styles from './multiRangeSlider.module.css';

interface SliderProps {
  min: number;
  max: number;
  setMin?: Dispatch<SetStateAction<number>>;
  setMax?: Dispatch<SetStateAction<number>>;
  setMinValueTileSet?: Dispatch<SetStateAction<number>>;
  setMaxValueTileSet?: Dispatch<SetStateAction<number>>;
}

const MultiRangeSlider = ({
  min,
  max,
  setMin,
  setMax,
  setMinValueTileSet,
  setMaxValueTileSet,
}: SliderProps) => {
  const [minVal, setMinVal] = useState(min);
  const [maxVal, setMaxVal] = useState(max);
  const minValRef = useRef(min);
  const maxValRef = useRef(max);
  const range = useRef(null);

  // Convert to percentage
  const getPercent = useCallback(
    (value: number) => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  );

  // Set width of the range to decrease from the left side
  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxValRef.current);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, getPercent]);

  // Set width of the range to decrease from the right side
  useEffect(() => {
    const minPercent = getPercent(minValRef.current);
    const maxPercent = getPercent(maxVal);

    if (range.current) {
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal, getPercent]);

  return (
    <div className={styles.container}>
      <input
        type="range"
        min={min}
        max={max}
        value={minVal}
        onChange={(event) => {
          const value = Math.min(Number(event.target.value), maxVal - 1);
          setMinVal(value);
          setMin(value);
          setMinValueTileSet(value);
          minValRef.current = value;
        }}
        className={`${styles.thumb} ${styles['thumb--left']}`}
        style={{ zIndex: minVal > max - 100 && '5' }}
      />
      <input
        type="range"
        min={min}
        max={max}
        value={maxVal}
        onChange={(event) => {
          const value = Math.max(Number(event.target.value), minVal + 1);
          setMaxVal(value);
          setMax(value);
          setMaxValueTileSet(value);
          maxValRef.current = value;
        }}
        className={`${styles.thumb} ${styles['thumb--right']}`}
      />

      <div className={styles.slider}>
        <div className={styles.slider__track} />
        <div ref={range} className={styles.slider__range} />
        <div className={`${styles['slider__left-value']}`}>{minVal}</div>
        <div className={`${styles['slider__right-value']}`}>{maxVal}</div>
      </div>
    </div>
  );
};

MultiRangeSlider.propTypes = {
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
};

export default MultiRangeSlider;
