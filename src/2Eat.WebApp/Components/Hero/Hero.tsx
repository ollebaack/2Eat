import { Suspense } from "react";
import useQuery from "../../Helpers/useQuery";
import { FetchWeather } from "../../Services/Weather/api";

const Hero = () => {
  const weatherForecast = useQuery(FetchWeather, "weatherForecast");
  return (
    <div>
      <Suspense fallback={<div>Loading weather...</div>}>
        {weatherForecast?.map((forecast) => (
          <div key={forecast.date}>
            <p>{forecast.date}</p>
            <p>{forecast.temperatureC}</p>
            <p>{forecast.temperatureF}</p>
            <p>{forecast.summary}</p>
          </div>
        ))}
      </Suspense>
    </div>
  );
};

export default Hero;
