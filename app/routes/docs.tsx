import i18n from '@/i18n'
import type { ReactNode } from 'react'
import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
  return [
    { title: i18n.t('meta.docs.title') },
    { name: 'description', content: i18n.t('meta.docs.description') },
  ]
}

function Skill({ area, children }: { area: string; children: ReactNode }) {
  return (
    <div className="py-3 border-b border-black/5 dark:border-white/10 last:border-0 sm:flex sm:gap-6">
      <dt className="font-semibold text-foreground sm:w-48 sm:shrink-0">{area}</dt>
      <dd className="text-muted-foreground leading-relaxed">{children}</dd>
    </div>
  )
}

function Role({
  title,
  company,
  period,
  location,
  children,
}: {
  title: string
  company: string
  period: string
  location: string
  children: ReactNode
}) {
  return (
    <article className="mb-10 last:mb-0">
      <header className="mb-3">
        <h3 className="text-xl font-semibold text-foreground">
          {title} <span className="font-normal text-muted-foreground">— {company}</span>
        </h3>
        <p className="text-sm text-muted-foreground">
          {period} · {location}
        </p>
      </header>
      <ul className="list-disc pl-5 space-y-2 text-muted-foreground leading-relaxed">{children}</ul>
    </article>
  )
}

export default function Docs() {
  return (
    <div className="min-h-screen mt-20 mb-20 px-4">
      <article className="max-w-3xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Full Stack Software Engineer / AI-ML Engineer / Startup Founder
          </h1>
        </header>

        <section className="mb-14">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Core Skills
          </h2>
          <dl>
            <Skill area="Languages">Python, JavaScript, TypeScript, SQL, NoSQL.</Skill>
            <Skill area="Frameworks">
              Apache, DBT, React, React Native, Node.js, FastAPI, Flask, Vue.js, Angular.
            </Skill>
            <Skill area="Cloud &amp; Infrastructure">
              AWS (Lambda, Elastic Beanstalk), GCP (App Engine, Dataflow, Serverless, Cloud Run),
              Docker, Kubernetes, CI/CD (GitHub Actions).
            </Skill>
            <Skill area="Data &amp; Databases">
              PostgreSQL, MongoDB (aggregation pipelines), BigQuery, DynamoDB, Redis, Apache Beam,
              Looker Studio.
            </Skill>
            <Skill area="AI/ML">
              Scikit-learn, TensorFlow, Pandas, Gemini AI, LLM &amp; Agentic AI workflows, GraphQL.
            </Skill>
            <Skill area="Practices">
              Chatbot, Clean Architecture, Unit/Coverage Testing, Event-Driven Systems, Spec-Driven
              Development, Domain Driven Development, Clean Code, Message Queues (BullMQ), System
              Design, Graph/Data Modeling, Query Optimization, SQL Optimization, Requirements
              Engineering, RESTful APIs, Git, advanced English, Product Design, Chatbot designer,
              Startup Founder.
            </Skill>
          </dl>
        </section>

        <section className="mb-14">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6">
            Experience
          </h2>

          <Role
            title="Full Stack Software Engineer"
            company="Deitres S.A."
            period="Aug 2024 – Present"
            location="Florianópolis, Brazil"
          >
            <li>
              Built the Kairon WhatsApp chatbot end-to-end (Node.js + Meta API), using BullMQ and
              persistent Redis to schedule and recover smart-home alarm arm/disarm events reliably
              after server restarts.
            </li>
            <li>
              Modernized the flagship React Native smart-home app (upgraded 0.60 → latest version
              plus dependencies) and shipped device-management features on a legacy codebase without
              breaking production.
            </li>
            <li>
              Designed hex-protocol command interfaces (Node.js) for Alarm Panel and Amiar hardware
              integrations, and delivered Google Maps-based features for the CityMesh Angular 11
              platform.
            </li>
            <li>
              Built Maia, a WhatsApp safety-check chatbot using React Native Background Geolocation
              to detect users entering/leaving geo-fences and prompt well-being confirmations.
            </li>
            <li>
              Optimized queries to perform much quicker and also integrated to the app as paginated
              queries.
            </li>
            <li>
              Contributed to validate requirements, software architecture proposal, developed
              Spec-Driven Development as process.
            </li>
            <li>
              Log Monitor: I created a log monitor that has modes and a specially graph based log
              that uses React Flow to interpret log lines as nodes. But there are several filters
              and a feature called ‘Split Graph’ so whenever you see the log in graph mode you can
              split by user_id (any property of the log).
            </li>
            <li>
              Legacy code support and refactoring; contributed to React Native Legacy App upgrade.
              Introduced Agentic AI coding workflow.
            </li>
          </Role>

          <Role
            title="AI/ML Engineer (Contract)"
            company="Tech Pain"
            period="Aug 2025 – Mar 2026"
            location="Florianópolis, Brazil"
          >
            <li>
              Built a Scikit-learn ML pipeline to predict patient pain trajectories from clinical +
              medication data, applying graph theory to model medication interactions. Create a fast
              pipeline in Scikit-learn for training Random Forest with Graph computation, parsers
              measured by time.
            </li>
            <li>
              Stood up GitHub Actions CI/CD and a secure FastAPI + GraphQL project template;
              introduced Agentic AI coding workflow.
            </li>
          </Role>

          <Role
            title="Full Stack Software Engineer"
            company="Atar B2B"
            period="Aug 2022 – 2023"
            location="Florianópolis, Brazil"
          >
            <li>
              Contributed for a Python API for Brazil's Pix Devolution mechanism and a secure 2FA
              (TOTP) internet-banking flow deployed on GCP App Engine, with modern Vuejs stack.
            </li>
            <li>
              Led migration of client analytics from Datastore to BigQuery and mentored the team on
              Vue.js best practices.
            </li>
          </Role>

          <Role
            title="Full Stack Software Engineer"
            company="Prevision"
            period="Jul 2020 – Jun 2022"
            location="Florianópolis, Brazil"
          >
            <li>
              Drove adoption of a Data Warehouse architecture for a Civil Engineering planning
              platform, cutting reporting turnaround and improving cost visibility for engineers.
            </li>
            <li>
              Migrated infrastructure from AWS to GCP and optimized core PostgreSQL queries by
              embedding native SQL directly inside Ruby on Rails service code, improving search
              performance; mentored colleagues on Apache Beam and dashboarding, one later promoted
              to Team Lead.
            </li>
          </Role>

          <Role
            title="Full Stack Software Engineer"
            company="Indicium Tech"
            period="Dec 2019 – Jul 2020"
            location="Florianópolis, Brazil"
          >
            <li>
              Built REST APIs for a Business Intelligence product (Python, Plotly) and mentored the
              team on Git workflows.
            </li>
            <li>
              Programmed faster pipelines using PySpark and DynamoDB for processing high volume of
              data cutting a lot of the processing time.
            </li>
          </Role>

          <Role
            title="Full Stack Software Engineer"
            company="Agrosatelite G.A."
            period="Mar 2016 – Mar 2018"
            location="Florianópolis, Brazil"
          >
            <li>
              Developed Python software to compute crop evapotranspiration from Landsat/Sentinel
              satellite imagery and a REST API on AWS Lambda serving vegetation analytics to
              hundreds of thousands of crop sites.
            </li>
          </Role>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Education
          </h2>
          <h3 className="text-xl font-semibold text-foreground">B.S., Information Systems</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Federal University of Santa Catarina, Florianópolis, Brazil (2018–2022)
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Undergraduate research: Kubernetes/Docker message replication using the Raft protocol —{' '}
            <a
              href="https://github.com/tonussi/tcc"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              github.com/tonussi/tcc
            </a>
          </p>
        </section>
      </article>
    </div>
  )
}
