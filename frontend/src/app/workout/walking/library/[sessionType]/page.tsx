'use client';

import { useParams, useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { getArticle } from '@/lib/library-content';
import LibraryArticleComponent from '@/components/LibraryArticle';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function WalkingArticle() {
  const { sessionType } = useParams<{ sessionType: string }>();
  const { locale } = useI18n();
  const router = useRouter();
  const article = getArticle('marche', sessionType, locale);

  if (!article) {
    router.replace(`${BASE_PATH}/workout/walking/library`);
    return null;
  }

  return <LibraryArticleComponent article={article} sportType="marche" />;
}
