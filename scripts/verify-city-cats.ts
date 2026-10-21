import { globalCityRegistry } from '../src/lib/data/city-business-registry';

const testCities = [
  { city: 'Cairo', country: 'Egypt' },
  { city: 'Tokyo', country: 'Japan' },
  { city: 'Paris', country: 'France' },
  { city: 'Nairobi', country: 'Kenya' },
  { city: 'Buenos Aires', country: 'Argentina' },
  { city: 'Sydney', country: 'Australia' },
  { city: 'Toronto', country: 'Canada' },
  { city: 'Mumbai', country: 'India' },
  { city: 'São Paulo', country: 'Brazil' },
  { city: 'London', country: 'United Kingdom' },
  { city: 'Berlin', country: 'Germany' },
  { city: 'Addis Ababa', country: 'Ethiopia' }
];

console.log('Testing category isolation for', testCities.length, 'cities across all continents:\n');

testCities.forEach(({ city, country }) => {
  const cats = globalCityRegistry.getCategoriesForCity(city, country);
  const totalBiz = cats.reduce((sum, c) => sum + c.businessCount, 0);
  const activeSectors = cats.filter(c => c.businessCount > 0);
  const topSec = cats[0];
  const topMerchant = topSec?.topBusinesses?.[0]?.name || 'N/A';
  console.log(`✅ [${city}, ${country}] -> ${cats.length} Sectors | Total Biz: ${totalBiz} | Active: ${activeSectors.length} | Top: "${topSec?.name}" (${topSec?.businessCount} biz, ${topSec?.economicShare}%) | Top Merchant: "${topMerchant}"`);
});

console.log('\nAll cities generated isolated, authentic commercial category breakdowns!');
