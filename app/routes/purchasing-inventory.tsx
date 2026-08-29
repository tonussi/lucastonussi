import {
  BulletList,
  Eyebrow,
  PhoneMockup,
  Reveal,
  Section,
  ShowcaseRow,
} from '@/components/purchasing-inventory/ui'
import {
  ArrowRight,
  Boxes,
  CalendarDays,
  ChefHat,
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  Lightbulb,
  ListChecks,
  PieChart,
  ReceiptText,
  ScanLine,
  ShieldCheck,
  ShoppingBasket,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import type { Route } from './+types/purchasing-inventory'
import i18n from '@/i18n'

const SCREEN = (n: number) => `/purchasing-inventory/screen-${n}.jpg`

export function meta({}: Route.MetaArgs) {
  const title = i18n.t('meta.purchasingInventory.title')
  const description = i18n.t('meta.purchasingInventory.description')

  return [
    { title },
    { name: 'description', content: description },
    { name: 'keywords', content: i18n.t('meta.purchasingInventory.keywords') },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:locale', content: i18n.language.replace('-', '_') },
    { property: 'og:site_name', content: i18n.t('meta.siteName') },
    { property: 'og:image', content: '/pi.jpg' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: '/pi.jpg' },
  ]
}

export default function PurchasingInventoryPage() {
  const { t } = useTranslation()

  const problems = [
    { icon: ShoppingBasket, key: 'item1' },
    { icon: Wallet, key: 'item2' },
    { icon: ChefHat, key: 'item3' },
  ]

  const modules = [
    { icon: LayoutDashboard, key: 'f1' },
    { icon: Boxes, key: 'f2' },
    { icon: ChefHat, key: 'f3' },
    { icon: ListChecks, key: 'f4' },
    { icon: CreditCard, key: 'f5' },
    { icon: Lightbulb, key: 'f6' },
  ]

  return (
    <div className="bg-white text-foreground dark:bg-black">
      {/* ---------------------------------------------------------------- Hero */}
      <Section id="top" className="pt-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.16),transparent_60%)]"
        />
        <div className="relative grid items-center gap-16 lg:grid-cols-2">
          <Reveal>
            <Eyebrow>
              <ShoppingBasket className="h-3.5 w-3.5" />
              {t('purchasingInventory.hero.badge')}
            </Eyebrow>

            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
              {t('purchasingInventory.hero.title')}{' '}
              <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-emerald-400">
                {t('purchasingInventory.hero.titleAccent')}
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {t('purchasingInventory.hero.subtitle')}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#scan"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-medium text-white shadow-lg shadow-blue-500/25 transition-transform hover:scale-[1.03]"
              >
                {t('purchasingInventory.hero.ctaPrimary')}
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 font-medium transition-colors hover:bg-secondary"
              >
                {t('purchasingInventory.hero.ctaSecondary')}
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <ScanLine className="h-4 w-4 text-blue-500" />
                {t('purchasingInventory.hero.pill1')}
              </span>
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                {t('purchasingInventory.hero.pill2')}
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-indigo-500" />
                {t('purchasingInventory.hero.pill3')}
              </span>
            </div>
          </Reveal>

          {/* Three overlapping screens, the classic app-store hero fan */}
          <Reveal delay={150} className="relative">
            <div className="relative flex items-center justify-center">
              <PhoneMockup
                src={SCREEN(5)}
                alt={t('purchasingInventory.alt.products')}
                eager
                className="hidden w-[180px] -rotate-6 opacity-60 sm:block sm:w-[200px] sm:-mr-16"
              />
              <PhoneMockup
                src={SCREEN(1)}
                alt={t('purchasingInventory.alt.dashboard')}
                eager
                className="relative z-10 w-[240px] sm:w-[260px]"
              />
              <PhoneMockup
                src={SCREEN(8)}
                alt={t('purchasingInventory.alt.extracts')}
                eager
                className="hidden w-[180px] rotate-6 opacity-60 sm:block sm:w-[200px] sm:-ml-16"
              />
            </div>
          </Reveal>
        </div>

        <a
          href="#problem"
          aria-label={t('purchasingInventory.scrollCue')}
          className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 text-muted-foreground transition-colors hover:text-foreground sm:block"
        >
          <ChevronDown className="h-7 w-7 animate-bounce motion-reduce:animate-none" />
        </a>
      </Section>

      {/* ------------------------------------------------------------- Problem */}
      <Section id="problem" className="bg-secondary/40 dark:bg-gray-950">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>{t('purchasingInventory.problem.eyebrow')}</Eyebrow>
          <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-5xl">
            {t('purchasingInventory.problem.title')}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            {t('purchasingInventory.problem.subtitle')}
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {problems.map(({ icon: Icon, key }, index) => (
            <Reveal key={key} delay={index * 120}>
              <div className="h-full rounded-2xl border border-border bg-card p-8 shadow-sm">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 text-red-500 dark:text-red-400">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">
                  {t(`purchasingInventory.problem.${key}Title`)}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {t(`purchasingInventory.problem.${key}Desc`)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------- Step 1: scanning */}
      <Section id="scan">
        <ShowcaseRow
          media={
            <div className="flex items-center justify-center gap-4 sm:gap-8">
              <PhoneMockup
                src={SCREEN(3)}
                alt={t('purchasingInventory.alt.camera')}
                className="w-[190px] -rotate-3 sm:w-[240px]"
                glow="from-amber-500/25 via-orange-400/10"
              />
              <PhoneMockup
                src={SCREEN(4)}
                alt={t('purchasingInventory.alt.receipt')}
                className="w-[190px] rotate-3 sm:w-[240px]"
                glow="from-blue-500/25 via-cyan-400/10"
              />
            </div>
          }
        >
          <Eyebrow>
            <ScanLine className="h-3.5 w-3.5" />
            {t('purchasingInventory.scan.eyebrow')}
          </Eyebrow>
          <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-5xl">
            {t('purchasingInventory.scan.title')}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            {t('purchasingInventory.scan.description')}
          </p>
          <BulletList
            items={[
              t('purchasingInventory.scan.b1'),
              t('purchasingInventory.scan.b2'),
              t('purchasingInventory.scan.b3'),
            ]}
          />
        </ShowcaseRow>
      </Section>

      {/* --------------------------------------------------- Step 2: inventory */}
      <Section id="inventory" className="bg-secondary/40 dark:bg-gray-950">
        <ShowcaseRow
          reverse
          media={
            <PhoneMockup
              src={SCREEN(5)}
              alt={t('purchasingInventory.alt.products')}
              glow="from-emerald-500/25 via-teal-400/10"
            />
          }
        >
          <Eyebrow>
            <Boxes className="h-3.5 w-3.5" />
            {t('purchasingInventory.inventory.eyebrow')}
          </Eyebrow>
          <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-5xl">
            {t('purchasingInventory.inventory.title')}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            {t('purchasingInventory.inventory.description')}
          </p>
          <BulletList
            items={[
              t('purchasingInventory.inventory.b1'),
              t('purchasingInventory.inventory.b2'),
              t('purchasingInventory.inventory.b3'),
            ]}
          />
        </ShowcaseRow>
      </Section>

      {/* ---------------------------------------------------- Step 3: AI list */}
      <Section id="checklist">
        <ShowcaseRow
          media={
            <PhoneMockup
              src={SCREEN(7)}
              alt={t('purchasingInventory.alt.checklist')}
              glow="from-violet-500/25 via-fuchsia-400/10"
            />
          }
        >
          <Eyebrow>
            <Sparkles className="h-3.5 w-3.5" />
            {t('purchasingInventory.checklist.eyebrow')}
          </Eyebrow>
          <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-5xl">
            {t('purchasingInventory.checklist.title')}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            {t('purchasingInventory.checklist.description')}
          </p>
          <BulletList
            items={[
              t('purchasingInventory.checklist.b1'),
              t('purchasingInventory.checklist.b2'),
              t('purchasingInventory.checklist.b3'),
            ]}
          />
        </ShowcaseRow>
      </Section>

      {/* -------------------------------------------------------- Meal planner */}
      <Section id="planner" className="bg-secondary/40 dark:bg-gray-950">
        <ShowcaseRow
          reverse
          media={
            <PhoneMockup
              src={SCREEN(6)}
              alt={t('purchasingInventory.alt.planner')}
              glow="from-orange-500/25 via-amber-400/10"
            />
          }
        >
          <Eyebrow>
            <CalendarDays className="h-3.5 w-3.5" />
            {t('purchasingInventory.planner.eyebrow')}
          </Eyebrow>
          <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-5xl">
            {t('purchasingInventory.planner.title')}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            {t('purchasingInventory.planner.description')}
          </p>
          <BulletList
            items={[
              t('purchasingInventory.planner.b1'),
              t('purchasingInventory.planner.b2'),
              t('purchasingInventory.planner.b3'),
            ]}
          />
        </ShowcaseRow>
      </Section>

      {/* ------------------------------------------------------------ Spending */}
      <Section id="spending">
        <ShowcaseRow
          media={
            <PhoneMockup
              src={SCREEN(8)}
              alt={t('purchasingInventory.alt.extracts')}
              glow="from-emerald-500/25 via-lime-400/10"
            />
          }
        >
          <Eyebrow>
            <PieChart className="h-3.5 w-3.5" />
            {t('purchasingInventory.spending.eyebrow')}
          </Eyebrow>
          <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-5xl">
            {t('purchasingInventory.spending.title')}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            {t('purchasingInventory.spending.description')}
          </p>
          <BulletList
            items={[
              t('purchasingInventory.spending.b1'),
              t('purchasingInventory.spending.b2'),
              t('purchasingInventory.spending.b3'),
            ]}
          />
        </ShowcaseRow>
      </Section>

      {/* ----------------------------------------------------------- All in one */}
      <Section id="modules" className="bg-secondary/40 dark:bg-gray-950">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-16">
          <div>
            <Reveal className="max-w-2xl">
              <Eyebrow>
                <ReceiptText className="h-3.5 w-3.5" />
                {t('purchasingInventory.modules.eyebrow')}
              </Eyebrow>
              <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-5xl">
                {t('purchasingInventory.modules.title')}
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                {t('purchasingInventory.modules.subtitle')}
              </p>
            </Reveal>

            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {modules.map(({ icon: Icon, key }, index) => (
                <Reveal key={key} delay={index * 80}>
                  <div className="flex h-full items-start gap-4 rounded-2xl border border-border bg-card p-5">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {t(`purchasingInventory.modules.${key}Title`)}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {t(`purchasingInventory.modules.${key}Desc`)}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={160} className="hidden lg:block">
            <PhoneMockup
              src={SCREEN(2)}
              alt={t('purchasingInventory.alt.menu')}
              className="w-[240px] sm:w-[240px]"
              glow="from-indigo-500/25 via-blue-400/10"
            />
          </Reveal>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- CTA */}
      <Section id="cta" contentClassName="max-w-3xl">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(16,185,129,0.16),transparent_60%)]"
        />
        <Reveal className="relative text-center">
          <div className="mx-auto mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 text-white shadow-xl shadow-blue-500/25">
            <ShoppingBasket className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
            {t('purchasingInventory.cta.title')}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {t('purchasingInventory.cta.subtitle')}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-3.5 font-medium text-white shadow-lg shadow-blue-500/25 transition-transform hover:scale-[1.03]"
            >
              {t('purchasingInventory.cta.primary')}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/docs"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-7 py-3.5 font-medium transition-colors hover:bg-secondary"
            >
              {t('purchasingInventory.cta.secondary')}
            </Link>
          </div>

          <p className="mt-10 text-sm text-muted-foreground">
            <Link to="/how-to-delete-your-user" className="underline underline-offset-4">
              {t('purchasingInventory.cta.footnote')}
            </Link>
          </p>
        </Reveal>
      </Section>
    </div>
  )
}
