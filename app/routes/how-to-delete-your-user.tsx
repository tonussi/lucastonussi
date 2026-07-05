import { UserX, Mail, ShieldCheck, Clock, AlertTriangle, CheckCircle, CreditCard } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'How to Delete Your User - T Labs' },
    {
      name: 'description',
      content:
        'Learn how to delete your account and all associated data from the T Labs purchasing inventory app.',
    },
    { name: 'robots', content: 'index, follow' },
  ]
}

export default function HowToDeleteYourUser() {
  const { t } = useTranslation()

  const steps = [
    {
      step: 1,
      title: t('deleteUser.step1Title'),
      description: t('deleteUser.step1Description'),
    },
    {
      step: 2,
      title: t('deleteUser.step2Title'),
      description: t('deleteUser.step2Description'),
    },
    {
      step: 3,
      title: t('deleteUser.step3Title'),
      description: t('deleteUser.step3Description'),
    },
    {
      step: 4,
      title: t('deleteUser.step4Title'),
      description: t('deleteUser.step4Description'),
    },
  ]

  const deletedItems = [
    t('deleteUser.deletedItem1'),
    t('deleteUser.deletedItem2'),
    t('deleteUser.deletedItem3'),
    t('deleteUser.deletedItem4'),
    t('deleteUser.deletedItem5'),
    t('deleteUser.deletedItem6'),
  ]

  return (
    <div className="min-h-screen mt-20 mb-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/10 dark:from-red-500/20 dark:to-orange-500/20 mb-6 border border-red-500/20 dark:border-red-400/20">
            <UserX className="w-10 h-10 text-red-500 dark:text-red-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-4">
            {t('deleteUser.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {t('deleteUser.subtitle')}
          </p>
        </header>

        {/* Cancel payment plan warning */}
        <section className="mb-16">
          <div className="p-6 rounded-2xl border border-amber-500/20 dark:border-amber-400/20 bg-amber-500/5 dark:bg-amber-500/5">
            <div className="flex items-start gap-4">
              <CreditCard className="w-6 h-6 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-foreground font-semibold mb-1">{t('deleteUser.cancelPlanTitle')}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t('deleteUser.cancelPlanDescription')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="space-y-6 mb-16">
          <h2 className="text-2xl font-semibold text-foreground mb-8 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
            {t('deleteUser.deletionSteps')}
          </h2>

          <div className="space-y-4">
            {steps.map(({ step, title, description }) => (
              <div
                key={step}
                className="group relative flex gap-5 p-6 rounded-2xl border border-border bg-card/50 dark:bg-card/30 backdrop-blur-sm hover:border-border/80 hover:bg-card/80 dark:hover:bg-card/50 transition-all duration-300"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
                  {step}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What gets deleted */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-foreground mb-8 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            {t('deleteUser.whatGetsDeleted')}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {deletedItems.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 p-4 rounded-xl border border-red-500/10 dark:border-red-400/10 bg-red-500/5 dark:bg-red-500/5"
              >
                <div className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400 flex-shrink-0" />
                <span className="text-foreground text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-foreground mb-8 flex items-center gap-3">
            <Clock className="w-6 h-6 text-blue-500" />
            {t('deleteUser.processingTimeline')}
          </h2>
          <div className="p-6 rounded-2xl border border-border bg-card/50 dark:bg-card/30 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-500/20" />
              </div>
              <div>
                <p className="text-foreground font-medium mb-1">
                  {t('deleteUser.timelineTitle')}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t('deleteUser.timelineDescription')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy note */}
        <section className="mb-16">
          <div className="p-6 rounded-2xl border border-emerald-500/20 dark:border-emerald-400/20 bg-emerald-500/5 dark:bg-emerald-500/5">
            <div className="flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-foreground font-semibold mb-1">{t('deleteUser.privacyTitle')}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t('deleteUser.privacyDescription')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="text-center pb-10">
          <div className="inline-flex items-center gap-2 text-muted-foreground text-sm">
            <Mail className="w-4 h-4" />
            <span>{t('deleteUser.contactCta')}</span>
            <a
              href="mailto:lptonussi@gmail.com"
              className="text-blue-500 dark:text-blue-400 hover:underline font-medium"
            >
              lptonussi@gmail.com
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
