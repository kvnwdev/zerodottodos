# 0.todos

minimal task tracking through dots

## vision

to read more about the vision, please see [VISION.md](VISION.md)

## stack

built with t3:

- [next.js](https://nextjs.org)
- [typescript](https://typescriptlang.org)
- [tailwind css](https://tailwindcss.com)
- [trpc](https://trpc.io)
- [prisma](https://prisma.io)
- [nextauth.js](https://next-auth.js.org)
- [shadcn/ui](https://ui.shadcn.com)

## development

### prereqs

- node.js 18+
- npm/yarn/pnpm

### local setup

1. clone

```bash
git clone https://github.com/kvnwdev/zerodottodos.git
cd zerodottodos
```

2. install

```bash
npm install
```

3. database

```bash
chmod +x ./setup_db.sh
./setup_db.sh
```

4. environment

```bash
cp .env-e .env
```

add github credentials and database URL

4. database again

```bash
npm run db:generate
```

5. run

```bash
npm run dev
```

## deployment

1. deployed with vercel

## license

licensed under [non-commercial use](LICENSE)

## contributions

honestly i'm just working on this for myself. if you would like to contribute, feel free to do so, but I am unsure how much I will merge.
