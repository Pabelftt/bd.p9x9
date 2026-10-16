import connectDB from "./db";
import Movie from "./models/Movie";
import CountModel from "./models/Count";
import { SITE_CONFIG } from "./config";

export async function getMoviePage(query = "", skip = 0, limit = SITE_CONFIG.moviePageSize) {
  await connectDB();
  const safeSkip = Math.max(0, parseInt(skip, 10) || 0);
  const safeLimit = Math.max(1, parseInt(limit, 10) || SITE_CONFIG.moviePageSize);

  if (query && query.trim()) {
    const trimmed = query.trim();
    const textFilter = { $text: { $search: trimmed } };
    const hasTextMatches = await Movie.exists(textFilter);

    const filter = hasTextMatches
      ? textFilter
      : { hadding: { $regex: trimmed.split(" ")[0], $options: "i" } };

    let request = Movie.find(filter);
    if (hasTextMatches) {
      request = request
        .select({ score: { $meta: "textScore" } })
        .sort({ score: { $meta: "textScore" } });
    } else {
      request = request.sort({ _id: -1 });
    }

    const items = await request.skip(safeSkip).limit(safeLimit + 1).lean();
    const hasMore = items.length > safeLimit;
    const movies = items.slice(0, safeLimit);
    return { movies, hasMore };
  }

  const items = await Movie.find({})
    .sort({ _id: -1 })
    .skip(safeSkip)
    .limit(safeLimit + 1)
    .lean();

  const hasMore = items.length > safeLimit;
  let movies = items.slice(0, safeLimit);

  // If initial page load without query, apply random shuffle to create freshness like existing site
  if (safeSkip === 0 && !query) {
    for (let i = movies.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [movies[i], movies[j]] = [movies[j], movies[i]];
    }
  }

  return { movies, hasMore };
}

export async function getMovieById(id) {
  if (!id) return null;
  await connectDB();
  return Movie.findOne({ id }).lean();
}

export async function getSuggestedMovies(excludeId, skip = 0, limit = SITE_CONFIG.moviePageSize) {
  await connectDB();
  const safeSkip = Math.max(0, parseInt(skip, 10) || 0);
  const safeLimit = Math.max(1, parseInt(limit, 10) || SITE_CONFIG.moviePageSize);

  const filter = excludeId ? { id: { $ne: excludeId } } : {};
  const items = await Movie.find(filter)
    .sort({ _id: -1 })
    .skip(safeSkip)
    .limit(safeLimit + 1)
    .lean();

  const hasMore = items.length > safeLimit;
  const movies = items.slice(0, safeLimit);
  return { movies, hasMore };
}

export async function getLatestMovies(limit = 5) {
  await connectDB();
  return Movie.find({})
    .sort({ _id: -1 })
    .limit(limit)
    .select("id hadding img")
    .lean();
}

export async function getCountDoc() {
  await connectDB();
  const doc = await CountModel.findOne().lean();
  return {
    randomData: doc ? doc.random : 1,
    randomCount: doc ? doc.count : 0,
  };
}

export function hasSmartLinkFlowCookie(cookieString = "", videoId = "") {
  if (!cookieString || !videoId) return false;
  const targetCookie = cookieString
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SITE_CONFIG.cookieName}=`));

  if (!targetCookie) return false;

  try {
    const rawValue = targetCookie.slice(`${SITE_CONFIG.cookieName}=`.length);
    const flow = JSON.parse(decodeURIComponent(rawValue));
    const safePath = `/movie/${encodeURIComponent(videoId)}`;
    return flow.videoId === videoId && flow.pagePath === safePath;
  } catch {
    return false;
  }
}
