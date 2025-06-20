import { useTranslation } from 'react-i18next'

export function MonitorSellsDescription() {
  const { t } = useTranslation()

  return (
    <h1
      className="
    bg-[radial-gradient(138.06%_1036.51%_at_95.25%_-2.54%,_#7ED4FD_14.06%,#709DF7_51.02%,#4D78EF_79.09%)]
    bg-clip-text
    text-3xl
    leading-[1.2]
    tracking-tighter
    text-transparent
    sm:text-center
    sm:text-[3rem]
    xs:text-center
    xs:text-[2rem]
    sm:leading-[4.75rem]
    lg:text-left"
    >
      {t('monitorSells.description')}
    </h1>
  )
}
