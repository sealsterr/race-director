import ferrari499pImage from "../../../assets/driver-cars-cutout/ferrari-499p.png";
import ferrari296Image from "../../../assets/driver-cars-cutout/ferrari-296-lmgt3.png";
import porsche963Image from "../../../assets/driver-cars-cutout/porsche-963.png";
import porsche911Image from "../../../assets/driver-cars-cutout/porsche-911-gt3-r.png";
import toyotaGr010Image from "../../../assets/driver-cars-cutout/toyota-gr010.png";
import cadillacVSeriesRImage from "../../../assets/driver-cars-cutout/cadillac-v-series-r.png";
import peugeot9x8Image from "../../../assets/driver-cars-cutout/peugeot-9x8.png";
import alpineA424Image from "../../../assets/driver-cars-cutout/alpine-a424.png";
import bmwMHybridV8Image from "../../../assets/driver-cars-cutout/bmw-m-hybrid-v8.png";
import bmwM4Image from "../../../assets/driver-cars-cutout/bmw-m4-lmgt3.png";
import astonVantageImage from "../../../assets/driver-cars-cutout/aston-martin-vantage-lmgt3.png";
import lamborghiniHuracanImage from "../../../assets/driver-cars-cutout/lamborghini-huracan-lmgt3-evo2.png";
import lamborghiniSc63Image from "../../../assets/driver-cars-cutout/lamborghini-sc63.png";
import mclaren720sImage from "../../../assets/driver-cars-cutout/mclaren-720s-lmgt3-evo.png";
import lexusRcfImage from "../../../assets/driver-cars-cutout/lexus-rc-f-lmgt3.png";
import corvetteZ06Image from "../../../assets/driver-cars-cutout/corvette-z06-lmgt3-r.png";
import fordMustangImage from "../../../assets/driver-cars-cutout/ford-mustang-lmgt3.png";
import oreca07Image from "../../../assets/driver-cars-cutout/oreca-07-gibson.png";
import mercedesAmgImage from "../../../assets/driver-cars-cutout/mercedes-amg-lmgt3.png";

export interface CarVisual {
    readonly label: string;
    readonly imageSrc: string;
    readonly imagePosition?: string;
    readonly imageScale?: number;
}

export const CAR_VISUALS: Array<{ match: RegExp; visual: CarVisual }> = [
    { match: /296/i, visual: { label: "Ferrari 296 LMGT3", imageSrc: ferrari296Image, imageScale: 1.22 } },
    { match: /499p|499 p/i, visual: { label: "Ferrari 499P", imageSrc: ferrari499pImage, imagePosition: "66% 58%", imageScale: 1.38 } },
    { match: /911/i, visual: { label: "Porsche 911 GT3 R", imageSrc: porsche911Image, imageScale: 1.2 } },
    { match: /963/i, visual: { label: "Porsche 963", imageSrc: porsche963Image, imagePosition: "56% 56%", imageScale: 1.28 } },
    { match: /toyota|gr010/i, visual: { label: "Toyota GR010 Hybrid", imageSrc: toyotaGr010Image, imageScale: 1.22 } },
    { match: /cadillac|v-series/i, visual: { label: "Cadillac V-Series.R", imageSrc: cadillacVSeriesRImage, imagePosition: "52% 56%", imageScale: 1.28 } },
    { match: /peugeot|9x8/i, visual: { label: "Peugeot 9X8", imageSrc: peugeot9x8Image, imageScale: 1.24 } },
    { match: /alpine|a424/i, visual: { label: "Alpine A424", imageSrc: alpineA424Image, imageScale: 1.2 } },
    { match: /m4/i, visual: { label: "BMW M4 LMGT3", imageSrc: bmwM4Image, imageScale: 1.18 } },
    { match: /m hybrid|hybrid v8/i, visual: { label: "BMW M Hybrid V8", imageSrc: bmwMHybridV8Image, imageScale: 1.24 } },
    { match: /aston martin|vantage/i, visual: { label: "Aston Martin Vantage LMGT3", imageSrc: astonVantageImage, imageScale: 1.16 } },
    { match: /sc63/i, visual: { label: "Lamborghini SC63", imageSrc: lamborghiniSc63Image, imageScale: 1.22 } },
    { match: /huracan/i, visual: { label: "Lamborghini Huracan LMGT3 EVO2", imageSrc: lamborghiniHuracanImage, imageScale: 1.15 } },
    { match: /mclaren|720s/i, visual: { label: "McLaren 720S LMGT3 Evo", imageSrc: mclaren720sImage, imageScale: 1.16 } },
    { match: /lexus|rc f/i, visual: { label: "Lexus RC F LMGT3", imageSrc: lexusRcfImage, imageScale: 1.15 } },
    { match: /corvette|z06/i, visual: { label: "Corvette Z06 LMGT3.R", imageSrc: corvetteZ06Image, imageScale: 1.18 } },
    { match: /ford|mustang/i, visual: { label: "Ford Mustang LMGT3", imageSrc: fordMustangImage, imageScale: 1.18 } },
    { match: /oreca|07|lmp2/i, visual: { label: "Oreca 07 Gibson", imageSrc: oreca07Image, imageScale: 1.22 } },
    { match: /mercedes|amg/i, visual: { label: "Mercedes-AMG LMGT3", imageSrc: mercedesAmgImage, imageScale: 1.18 } },
];
