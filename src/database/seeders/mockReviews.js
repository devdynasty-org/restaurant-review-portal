let reviews = [
  {
    id: 1, restaurantId: 1, status: 'approved', date: '2026-05-12',
    author: 'Nethmi P.',
    title: 'The butter chicken is worth the trip',
    body: 'Came for dinner with family and left planning the next visit. The butter chicken was rich without being heavy, and the naan came out blistered and hot. Service slowed a touch when it got busy.',
    categoryRatings: { food: 5, service: 4, ambiance: 4, value: 4 },
  },
  {
    id: 2, restaurantId: 1, status: 'approved', date: '2026-04-28',
    author: 'Dhanuka R.',
    title: 'Warm service, lovely courtyard',
    body: 'The staff remembered us from last time and the courtyard seating is gorgeous at dusk. Paneer was a highlight. A little pricey for the portion but we left happy.',
    categoryRatings: { food: 4, service: 5, ambiance: 3, value: 4 },
  },
  {
    id: 3, restaurantId: 2, status: 'approved', date: '2026-05-18',
    author: 'Ishara M.',
    title: 'Best omakase value in the city',
    body: 'Sat at the counter and let the chef decide. Every cut was pristine and the pacing was perfect. Tiny room so book ahead.',
    categoryRatings: { food: 5, service: 5, ambiance: 5, value: 4 },
  },
  {
    id: 4, restaurantId: 2, status: 'approved', date: '2026-05-02',
    author: 'Kavindu S.',
    title: 'Fresh fish, intimate room',
    body: 'Sashimi set was the move. Ambiance is calm and intimate. Slightly slow on a full night but the quality makes up for it.',
    categoryRatings: { food: 4, service: 4, ambiance: 5, value: 3 },
  },
  {
    id: 5, restaurantId: 3, status: 'approved', date: '2026-05-20',
    author: 'Amaya F.',
    title: 'A perfect group dinner',
    body: 'Eight of us, zero complaints. The diavola with chilli honey disappeared instantly and the cacio e pepe is the real deal. Wine list is short but smart.',
    categoryRatings: { food: 5, service: 5, ambiance: 5, value: 5 },
  },
  {
    id: 6, restaurantId: 4, status: 'approved', date: '2026-04-15',
    author: 'Ruwan J.',
    title: 'Solid dim sum, bring a crowd',
    body: 'Har gow and char siu bao were the standouts. The lazy Susan makes it fun for a group. Service was a bit rushed at peak lunch.',
    categoryRatings: { food: 3, service: 4, ambiance: 3, value: 4 },
  },
  {
    id: 7, restaurantId: 4, status: 'approved', date: '2026-03-30',
    author: 'Sanduni W.',
    title: 'Generous portions, good value',
    body: 'You get a lot of food for the price. The kung pao had real heat. Room is a little dated but the cooking is honest.',
    categoryRatings: { food: 4, service: 3, ambiance: 4, value: 3 },
  },
  // Grill House: pending only — demonstrates the "Not yet rated" + moderation flow.
  {
    id: 8, restaurantId: 5, status: 'pending', date: '2026-05-26',
    author: 'Tharindu B.',
    title: 'Great opening week',
    body: 'The smokehouse burger is messy in the best way and the ribs fall off the bone. Newly opened so a few service kinks, but very promising.',
    categoryRatings: { food: 4, service: 4, ambiance: 4, value: 4 },
  },
  {
    id: 9, restaurantId: 1, status: 'pending', date: '2026-05-27',
    author: 'Mihira L.',
    title: 'Lovely flavours, long wait',
    body: 'Food was excellent once it arrived but we waited 40 minutes on a Friday. Worth it, but go early.',
    categoryRatings: { food: 5, service: 3, ambiance: 4, value: 4 },
  },
];

let nextId = 10;

function getAll() { return reviews; }
function getById(id) { return reviews.find(r => r.id === id); }
function getByRestaurant(restaurantId, status) {
  return reviews.filter(r => r.restaurantId === restaurantId && (!status || r.status === status));
}
function add(review) {
  const r = { ...review, id: nextId++ };
  reviews.push(r);
  return r;
}
function approve(id) {
  const r = reviews.find(x => x.id === id);
  if (r) r.status = 'approved';
  return r;
}
function remove(id) {
  reviews = reviews.filter(r => r.id !== id);
}

module.exports = { getAll, getById, getByRestaurant, add, approve, remove };
