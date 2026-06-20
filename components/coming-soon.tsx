"use client"

import { Rocket, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslation, type TranslationKey } from "@/lib/i18n"

type ComingSoonProps = {
  titleKey?: TranslationKey
}

export function ComingSoon({ titleKey }: ComingSoonProps) {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Rocket className="h-10 w-10" strokeWidth={1.5} />
      </div>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
        {titleKey ? t(titleKey) : t("comingSoon.title")}
      </h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {t("comingSoon.description")}
      </p>
      <button
        onClick={() => router.back()}
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("comingSoon.goBack")}
      </button>
    </div>
  )
}
