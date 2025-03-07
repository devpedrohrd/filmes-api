import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { PrismaService } from "./config/PrismaService.js";
import { type Context } from "hono";
import { fetchMovies } from "./config/fetchMovies.js";

const app = new Hono();
const prismaService = new PrismaService();

app.post("/rdbms", async (c: Context) => {
  const { original_title } = await c.req.json();

  if (!original_title) {
    return c.text("Missing required fields", 400);
  }

  const movies = await fetchMovies(original_title);

  if (movies.message) {
    return c.text(movies.message, 404);
  }

  return c.json(movies);
});

app.get("/filmes", async (c: Context) => {
  const filmes = await prismaService.filmes.findMany();

  if (filmes.length === 0) {
    return c.text("No movies found", 404);
  }

  return c.json(filmes);
});

app.post("/filmes", async (c: Context) => {
  const { original_title, description, vote_average } = await c.req.json();

  if (!original_title || !description || !vote_average) {
    return c.text("Missing required fields", 400);
  }

  const existingMovie = await prismaService.filmes.findFirst({
    where: {
      original_title,
    },
  });

  if (existingMovie) {
    return c.text("Movie already exists", 400);
  }

  const filme = await prismaService.filmes.create({
    data: {
      original_title,
      vote_average,
      description,
    },
  });

  return c.json(filme);
});

app.put("/filmes/:id", async (c: Context) => {
  const { id } = c.req.param();

  if (!id || !/^\d+$/.test(id)) {
    return c.text("Invalid or missing ID", 400);
  }

  const existingMovie = await prismaService.filmes.findFirst({
    where: {
      id: Number(id),
    },
  });

  if (!existingMovie) {
    return c.text("Movie not found", 404);
  }

  const { original_title, description, vote_average } = await c.req.json();

  if (!original_title || !description || !vote_average) {
    return c.text("Missing required fields", 400);
  }

  const filme = await prismaService.filmes.update({
    where: {
      id: existingMovie.id,
    },
    data: {
      original_title,
      vote_average,
      description,
    },
  });

  return c.json(filme);
});

app.delete("/filmes/:id", async (c: Context) => {
  const { id } = c.req.param();

  if (!id || !/^\d+$/.test(id)) {
    return c.text("Invalid or missing ID", 400);
  }
  ("");

  const existingMovie = await prismaService.filmes.findFirst({
    where: {
      id: Number(id),
    },
  });

  if (!existingMovie) {
    return c.text("Movie not found", 404);
  }

  await prismaService.filmes.delete({
    where: {
      id: existingMovie.id,
    },
  });

  return c.text("Movie deleted successfully");
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
