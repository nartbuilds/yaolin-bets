import { z } from 'zod'

export const TeamSelectionSchema = z.object({
  head_id: z.string().uuid(),
  tail_id: z.string().uuid(),
  drum_id: z.string().uuid(),
  gong_id: z.string().uuid(),
  cymbal_id: z.string().uuid(),
}).refine((data) => {
  const ids = [data.head_id, data.tail_id, data.drum_id, data.gong_id, data.cymbal_id]
  const uniqueIds = new Set(ids)
  return uniqueIds.size === ids.length
}, {
  message: "All athletes must be different",
})

export const LoginSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(6),
})

export const RegisterSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(6),
})