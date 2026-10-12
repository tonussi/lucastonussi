import GameEngineWorkbench from '@/components/game-engine/workbench'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import type { Route } from '../+types/experiments'

interface NavigatorWithMobileHint extends Navigator {
  userAgentData?: {
    mobile?: boolean
  }
}

function isMobileDevice() {
  const navigatorWithHint = navigator as NavigatorWithMobileHint
  const mobileUserAgent = /Android|iPhone|iPod|IEMobile|Opera Mini|webOS|BlackBerry/i.test(
    navigator.userAgent,
  )
  const smallViewport = window.matchMedia('(max-width: 767px)').matches

  return Boolean(navigatorWithHint.userAgentData?.mobile || mobileUserAgent || smallViewport)
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'World Engine - Experiments' },
    {
      name: 'description',
      content:
        'Experimental browser game engine with a live Three.js viewport and visual flow editor',
    },
  ]
}

export default function BasicGamePhysicsPage() {
  const navigate = useNavigate()
  const [isCheckingDevice, setIsCheckingDevice] = useState(true)

  useEffect(() => {
    if (isMobileDevice()) {
      navigate('/', { replace: true })
      return
    }

    setIsCheckingDevice(false)
  }, [navigate])

  if (isCheckingDevice) return null

  return <GameEngineWorkbench />
}
