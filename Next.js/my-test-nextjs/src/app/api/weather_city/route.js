export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const apiKey = "b8a18d623529ce3f03455646b1ad3c3b";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=ja`;
  const res = await fetch(url);
  const weather = await res.json();
    console.log(weather)
  return Response.json({ weather });
}
