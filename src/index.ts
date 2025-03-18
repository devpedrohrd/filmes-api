import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { PrismaService } from "./config/PrismaService.js";
import { type Context } from "hono";
import { fetchMovies } from "./config/fetchMovies.js";
import { cors } from "hono/cors";

const app = new Hono();
const port = parseInt(process.env.PORT || "") || 3000;
const prismaService = new PrismaService();

app.use("*", cors({ origin: "http://localhost:8081" }));

app.post("/rdbms", async (c: Context) => {
  const { original_title } = await c.req.json();

  if (!original_title) {
    return c.text("Missing required fields", 400);
  }

  const reviews = await fetchMovies(original_title);

  if (reviews.message) {
    return c.text(reviews.message, 404);
  }

  return c.json(reviews);
});

app.get("/reviews", async (c: Context) => {
  const filmes = await prismaService.filmes.findMany();

  if (filmes.length === 0) {
    return c.text("No reviews found", 404);
  }

  return c.json(filmes);
});

app.post("/reviews", async (c: Context) => {
  const { original_title, description, vote_average } = await c.req.json();

  if (!original_title || !description || !vote_average) {
    return c.text("Missing required fields", 400);
  }

  const existingReview = await prismaService.filmes.findFirst({
    where: {
      original_title,
    },
  });

  if (existingReview) {
    return c.text("Review already exists", 400);
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

app.put("/reviews/:id", async (c: Context) => {
  const { id } = c.req.param();

  if (!id || !/^\d+$/.test(id)) {
    return c.text("Invalid or missing ID", 400);
  }

  const existingReview = await prismaService.filmes.findFirst({
    where: {
      id: Number(id),
    },
  });

  if (!existingReview) {
    return c.text("Review not found", 404);
  }

  const { original_title, description, vote_average } = await c.req.json();

  if (!original_title || !description || !vote_average) {
    return c.text("Missing required fields", 400);
  }

  const filme = await prismaService.filmes.update({
    where: {
      id: existingReview.id,
    },
    data: {
      original_title,
      vote_average,
      description,
    },
  });

  return c.json(filme);
});

app.delete("/reviews/:id", async (c: Context) => {
  const { id } = c.req.param();

  if (!id || !/^\d+$/.test(id)) {
    return c.text("Invalid or missing ID", 400);
  }

  const existingReview = await prismaService.filmes.findFirst({
    where: {
      id: Number(id),
    },
  });

  if (!existingReview) {
    return c.text("Review not found", 404);
  }

  await prismaService.filmes.delete({
    where: {
      id: existingReview.id,
    },
  });

  return c.text("Review deleted successfully");
});

serve({
  fetch: app.fetch,
  port,
});

export default app;