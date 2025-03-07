export const fetchMovies = async (query: string) => {
  const url = `${process.env.URL}?query=${encodeURIComponent(
    query
  )}&language=pt-BR&page=1&region=pt`;

  const token = process.env.TMDB_API_KEY;

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token?.toString()}`,
    },
  };

  try {
    const response = await fetch(url, options);
    const json = await response.json();

    if (json.results.length === 0) {
      return { message: "Nenhum filme encontrado" };
    }

    const movies = json.results.map((movie: any) => ({
      original_title: movie.original_title,
      overview: movie.overview,
      vote_average: movie.vote_average,
    }));

    return movies;
  } catch (err) {
    console.error(err);
  }
};
