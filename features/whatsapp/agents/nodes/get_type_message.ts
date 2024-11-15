import { END } from '@langchain/langgraph'

import type { StateAnnotation } from '../graph'
import { logger } from '@/lib/logger'

export function getTypeMessage(
  state: typeof StateAnnotation.State
): Partial<typeof StateAnnotation.State> {
  logger.info('----- GET TYPE MESSAGE NODE -----')

  return {}
}
