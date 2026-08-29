import type { Route } from './+types/home'
import i18n from '@/i18n'

export function meta({ }: Route.MetaArgs) {
  return [
    { title: i18n.t('meta.docs.title') },
    { name: 'description', content: i18n.t('meta.docs.description') },
  ]
}

export default function Docs() {
  return (
    <div className="h-full max-w-10/12 sm:max-w mx-auto mt-30 mb-30" style={{ height: '20vh' }}>
      🛠 Technical Toolbox

      - Languages: Python (Master), JavaScript/TypeScript (Expert), SQL (Master),
      Node.js (Expert), Ruby, Java, Go (Basic).
      - AI & Machine Learning: LLMs (Gemini, Agentic AI), Scikit-learn, TensorFlow,
      Pandas AI, Graph Theory for Data Handling.
      - Frontend & Mobile: React, React Native, VueJS (2/3), Angular, ThreeJS,
      Flutter.
      - Backend & Infrastructure: FastAPI, Flask, Ruby on Rails, GraphQL, REST,
      BullMQ, Redis, Docker, Kubernetes.
      - Cloud & Data: GCP (Expert), AWS (Expert), BigQuery, Apache Beam, PySpark,
      DBT, Looker Studio, Terraform.

      💼 Professional Experience

      Deitres S.A. | Full Stack Software Engineer | Aug 2024 – Present

      - Kairon Chatbot: Architected and developed a WhatsApp™ chatbot using Node.js,
      BullMQ, and Redis for event synchronization and scheduling.
      - Maia Chatbot: Implemented a safety-assurance chatbot using React Native
      Background Geolocation to monitor user geo-fences, utilizing Redis
      geo-cluster control and BullMQ to trigger automated WhatsApp safety
      messages.
      - Mobile Leadership: Managed React Native upgrades (v0.60 \rightarrow 0.65)
      and implemented complex asynchronous signal management for smart home
      security.
      - IoT/Hardware: Implemented hexadecimal protocol commands in Node.js to
      control Amiar and Alarm Panel hardware.

      Tech Pain | AI/ML Engineer (Contract) | Aug 2025 – 2026

      - ML Pipelines: Implementing Python 3 pipelines using Scikit-learn to extract
      predictions from patient data using Graph theory for medication analysis.
      - Architecture: Developing FastAPI templates with GraphQL and secure login for
      scalable AI service deployment.
      - Innovation: Driving the implementation of Agentic AI and LLM advancements
      (e.g., Pi coding agents).

      Atar B2B | Full Stack Software Engineer | Aug 2022 – 2023

      - Fintech: Contributed to the Python API for the "Special Mechanism for Pix
      Devolution" (Brazilian banking).
      - Security: Implemented secure 2FA TOTP mechanisms for Internet Banking web
      applications on GCP AppEngine.
      - Mentorship: Mentored new team members on VueJS best practices and backend
      architecture.

      Prevision | Full Stack Software Engineer | Jul 2020 – Jun 2022

      - Data Engineering: Advocated for Data Warehouse solutions and migrated core
      systems from AWS to GCP.
      - Mentorship: Trained colleagues in SQL optimization, Apache Beam, and Looker
      dashboarding.
      - Performance: Optimized search systems via SQL, significantly improving user
      experience and data accuracy.

      Indicium Tech | Full Stack Software Engineer | Dec 2019 – Jul 2020

      - BI Development: Developed Python-based REST APIs for Business Intelligence
      applications.
      - Data Stack: Leveraged PySpark, DynamoDB, and DBT for complex data
      transformations.

      Agrosatélite G.A. | Full Stack Software Engineer | Mar 2016 – Mar 2018

      - Agrotech: Developed Python software to calculate crop evapotranspiration
      using Landsat and Sentinel satellite imagery.
      - Cloud: Deployed scalable image-processing APIs via AWS Lambda.

      🎓 Education

      Federal University of Santa Catarina (UFSC)

      - B.S. in Information Systems | Graduated 2022
      - B.S. in Computer Science | Coursework 2012 – 2017
      - Dissertation: Distributed message replication using the Raft protocol within
      a Kubernetes/Docker layer.

      🌟 Projects & Research

      - Purchasing Inventory (Startup): A Python/GraphQL/React Native application
      using LLMs to optimize supermarket inventory/shopping experiences.
      - Menstrual Connect: A Flutter application focused on synchronized planning
      for couples.
      - Personal Portfolio: A high-performance site featuring React Native, ThreeJS,
      and Fiber.
      - Open Source/Research: Deep exploration of Kubernetes, Golang, and the Raft
      protocol for distributed systems.
    </div>
  )
}
