interface IBackdropProps {
  color: string
  color2: string
}

const Background = ({ color, color2 }: IBackdropProps) => {
  return (
    <div className="top-0 -z-10 h-full w-full bg-white">
      <div
        className={`absolute bottom-auto left-auto right-0 top-0 h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-[${color}] blur-[80px] opacity-50`}
      />
      <div
        className={`absolute bottom-auto left-40 top-50 h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-[${color2}] blur-[80px] opacity-50`}
      />
    </div>
  )
}

export default Background
