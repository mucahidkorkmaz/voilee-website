import { z } from "zod";
import { createMediaItem, deleteMediaItem, getAllMediaItems } from "../db";
import { adminProcedure, router } from "../_core/trpc";

export const mediaRouter = router({
  list: adminProcedure.query(async () => {
    return await getAllMediaItems();
  }),
  add: adminProcedure
    .input(
      z.object({
        url: z.string().url(),
        filename: z.string().optional(),
        mimeType: z.string().optional(),
        sizeBytes: z.number().optional(),
        alt: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return await createMediaItem(input);
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await deleteMediaItem(input.id);
    }),
});
