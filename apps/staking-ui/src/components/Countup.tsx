import { useEffect, useRef } from 'react'
import CountUp, { CountUpProps } from 'react-countup'

export default function CountUpMemo(props: CountUpProps) {
  const prevValueRef = useRef<number>()
  useEffect(() => {
    prevValueRef.current = props.end
  })
  return <CountUp {...props} start={prevValueRef.current} end={props.end} />
}
