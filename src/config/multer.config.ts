export type MulterConfig = {
  dest: string;
};

export const multerConfig = () => ({
  multer: {
    dest: process.env.MULTER_DEST ?? './uploads',
  } satisfies MulterConfig,
});
