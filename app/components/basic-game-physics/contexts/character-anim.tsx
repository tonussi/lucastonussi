import { createContext, useContext, useState, type PropsWithChildren } from 'react'

const CharacterAnimationsContext = createContext({})

export const CharacterAnimationsProvider = (props: PropsWithChildren) => {
  const [animationIndex, setAnimationIndex] = useState(0)
  const [animations, setAnimations] = useState([])

  return (
    <CharacterAnimationsContext.Provider
      value={{
        animationIndex,
        setAnimationIndex,
        animations,
        setAnimations,
      }}
    >
      {props.children}
    </CharacterAnimationsContext.Provider>
  )
}

export const useCharacterAnimations = () => {
  return useContext(CharacterAnimationsContext)
}
