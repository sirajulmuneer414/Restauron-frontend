import React, { useEffect, useRef } from 'react'
import './circle.css';




function Circle() {

    const circleRef = useRef(null);


    useEffect(() => {
        const circle = circleRef.current;

        const handleMouseMove = (event) => {
            const {clientX, clientY} = event;

            if(circle) {
                const {offsetWidth, offsetHeight} = circle;

                const x  = clientX - offsetWidth / 2;
                const y = clientY - offsetHeight / 2;

                circle.style.left = `${x}px`;
                circle.style.top = `${y}px`;

            }
        }

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        }
    },[]);
  return (
    <>
    <div className='w-4 h-4 bg-white border border-white rounded-full circle absolute transition ' ref={circleRef} >

    </div>
    </>
  )
}

export default Circle;