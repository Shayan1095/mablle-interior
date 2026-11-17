import { defaults, filterProducts, money, products } from './catalog.js';
import { services } from './service-data.js';

export const initialGuideState = { intent: null, stage: null, category: null, query: '', material: null, budget: null };
export const welcomeMessage = {
  text: "Hello, I'm the Mablle Guide. Looking for a particular piece, or thinking about a room? Let's find a good place to start.",
  suggestions: ['Find a piece', 'Plan a room', 'Delivery & care'],
};
const startChoices = ['Find a piece', 'Plan a room', 'Product prices'];
const budgetChoices = ['Under 50k', 'Under 100k', 'Any budget'];
const isRange = text => /\bbetween\b|\d[\d,.]*\s*(?:k|thousand|lakhs?|lacs?)?\s*(?:to|–|-)\s*\d/.test(text);

export function parseBudget(text) {
  const normalized = text.toLowerCase();
  if (/(?:^|\s)-\s*\d/.test(normalized)) return undefined;
  if (/\b(?:any budget|all prices|no budget limit|no limit)\b/.test(normalized)) return 'all';
  if (isRange(normalized)) return undefined;
  const amount = '(\\d[\\d,]*(?:\\.\\d+)?)';
  const unit = '(k|thousand|lakhs?|lacs?)?';
  const pattern = new RegExp(`(?:under|below|up to|upto|within|maximum|max|budget(?: is| of)?|around|about|pkr|rs\\.?)\\s*(?:pkr|rs\\.?)?\\s*${amount}\\s*${unit}\\b`, 'i');
  const match = normalized.match(pattern) || normalized.match(/\b(\d[\d,]*(?:\.\d+)?)\s*(k|thousand|lakhs?|lacs?)\b/) || normalized.match(/^(\d[\d,]*(?:\.\d+)?)\s*(k|thousand|lakhs?|lacs?)?$/);
  if (!match) return undefined;
  const multiplier = /^lac|^lakh/.test(match[2] || '') ? 100000 : /^(k|thousand)$/.test(match[2] || '') ? 1000 : 1;
  const value = Number(match[1].replaceAll(',', '')) * multiplier;
  return Number.isFinite(value) && value > 0 && value <= 100000000 ? Math.round(value) : undefined;
}

function categoryFrom(text) {
  if (/\b(sofas?|couches?|chairs?|armchairs?|seats?|seating)\b/.test(text)) return { category: 'Seating', query: /\bsofa|\bcouch/.test(text) ? 'sofa' : /\bchair|\barmchair/.test(text) ? 'chair' : '' };
  if (/\b(tables?|dining|bedside)\b/.test(text)) return { category: 'Tables', query: /\bdining\b/.test(text) ? 'dining' : /\bside table|\bbedside\b/.test(text) ? 'side' : '' };
  if (/\b(lamps?|lighting|lights?|pendants?)\b/.test(text)) return { category: 'Lighting', query: /\bpendant/.test(text) ? 'pendant' : '' };
  if (/\b(all pieces|all products|everything)\b/.test(text)) return { category: 'All pieces', query: '' };
  return null;
}

function namedProduct(text) {
  const aliases = { 'sora-sofa': /\bsora\b/, 'arc-chair': /\barc\b/, 'alba-chair': /\balba\b/, 'pebble-table': /\bpebble\b/, 'form-lamp': /\b(?:form (?:task )?lamp|task lamp)\b/, 'linea-dining': /\blinea\b/ };
  return products.find(product => aliases[product.id].test(text));
}

function inquiry(context, interest = 'Interior design') {
  return { type: 'inquiry', label: 'Start a demo inquiry', context, interest };
}

function results(state) {
  const filters = { ...defaults, category: state.category || 'All pieces', q: state.query || '', material: state.material || 'All materials', budget: state.budget == null || state.budget === 'all' ? 'all' : String(state.budget), sort: 'low' };
  const matches = filterProducts(filters);
  const budget = filters.budget === 'all' ? '' : ` within ${money(Number(filters.budget))}`;
  return {
    state: { ...state, intent: 'catalog', stage: 'results' },
    message: {
      text: matches.length ? `I found ${matches.length} ${matches.length === 1 ? 'piece' : 'pieces'}${budget} in the sample collection. ${matches.length > 3 ? 'Here are the three lowest-priced options.' : 'Open a piece to explore the details.'}\nThese are illustrative PKR prices.` : `There isn't a matching piece${budget} in this sample collection. Try a different category or a higher budget; I won't suggest something outside your limit.`,
      productIds: matches.slice(0, 3).map(product => product.id),
      action: matches.length ? { type: 'collection', label: `Browse ${matches.length === 1 ? 'this piece' : `all ${matches.length} matches`}`, filters } : null,
      suggestions: matches.length ? ['Change my budget', 'Plan a room', 'Start over'] : ['Any budget', 'Seating', 'Start over'],
    },
  };
}

export function respondToGuide(input, previous = initialGuideState) {
  const text = String(input).trim().toLowerCase().replace(/\s+/g, ' ');
  let state = { ...previous };
  const reply = (message, next = state) => ({ state: next, message });
  if (!text || /^(start over|reset|restart|hello|hi|hey)$/.test(text)) return reply(welcomeMessage, { ...initialGuideState });

  // Policies and live business facts are deliberately never inferred from product data.
  if (/\b(deliver\w*|ship\w*|care|clean\w*)\b/.test(text)) return reply({ text: 'For care, use the material-specific guide supplied with the final product. Delivery areas, charges and lead times are not confirmed in this demo. A real inquiry would confirm these details before you proceed.', action: inquiry('Product care and delivery question', 'A particular piece'), suggestions: ['Find a piece', 'Product prices'] });
  if (/\b(stock|inventory|available|availability|return\w*|refund\w*|warranty|whatsapp|phone|address|contact details)\b/.test(text)) return reply({ text: "This preview doesn't have live stock, confirmed business policies or real contact details. I can help you explore the sample catalog, or prepare a demo inquiry for the information you need.", action: inquiry(input, state.intent === 'catalog' ? 'A particular piece' : 'Interior design'), suggestions: startChoices });
  if (/\b(demo|preview|real prices|final prices?|prices?(?: are)? final|illustrative|ai|chatbot)\b/.test(text)) return reply({ text: "I'm a guided helper using the sample catalog, not a live agent or a general-purpose AI. Products and PKR prices are illustrative. This preview doesn't send messages, make bookings or save your chat.", suggestions: startChoices });
  if (/\b(order|pay|payment|checkout|book|booking|appointment|human|agent|consultation)\b/.test(text)) return reply({ text: "I can open a demo inquiry for you. This front-end preview doesn't send messages, take payments or book appointments, and I'm a guided catalog helper rather than a live agent.", action: inquiry('A conversation started with the Mablle Guide'), suggestions: ['Plan a room', 'Find a piece'] });

  const service = /\b(styling|style my room)\b/.test(text) ? services[0]
    : /\b(whole[ -]home|whole house|entire home)\b/.test(text) ? services[2]
      : /\b(interior design|full[ -]room design|room design)\b/.test(text) ? services[1] : null;
  if (service) return reply({ text: `${service.name}: ${service.price}.\n${service.body}\nIncludes: ${service.scope}.\nThis is an illustrative design fee; furniture and installation are separate.`, serviceId: service.id, action: inquiry(`${service.name} · ${service.price}`, service.interest), suggestions: ['Room styling', 'Interior design', 'Whole-home concept'] }, { ...initialGuideState, intent: 'service', stage: 'service' });
  if (/\b(plan a room|design services|services|design help|design a room|help with my room)\b/.test(text)) return reply({ text: "What kind of help feels right? Room styling brings the details together; interior design shapes a full room; a whole-home concept connects several spaces.", suggestions: ['Room styling', 'Interior design', 'Whole-home concept'] }, { ...initialGuideState, intent: 'service', stage: 'service' });

  const budget = parseBudget(text);
  const product = namedProduct(text);
  const category = categoryFrom(text);
  const material = ['Wood', 'Metal', 'Glass', 'Upholstery'].find(value => new RegExp(`\\b${value.toLowerCase()}\\b`).test(text));
  if (product && budget === undefined) return reply({ text: `${product.name} starts at ${money(product.price)}.\nDimensions: ${product.dimensions}. Material: ${product.material}.\nFinishes: ${product.finishes.map(finish => finish.name).join(', ')}.\nThe specifications and prices are illustrative.`, productIds: [product.id], suggestions: ['Find a piece', 'Delivery & care', 'Plan a room'] }, { ...initialGuideState, intent: 'catalog', stage: 'results', category: product.category, query: product.name });

  if (/\b(rugs?|beds?|curtains?|vases?|decor)\b/.test(text)) return reply({ text: "Those pieces aren't in this sample collection yet. I can currently help with seating, tables and lighting, or introduce you to the design-service options.", suggestions: ['Seating', 'Tables', 'Lighting', 'Plan a room'] }, { ...initialGuideState, intent: 'catalog', stage: 'category' });
  if (isRange(text)) return reply({ text: 'I can filter by a maximum price. What upper budget in PKR should I use?', suggestions: budgetChoices }, { ...state, ...category, intent: 'catalog', stage: 'budget' });
  if (/\b(change my budget|cheaper|less expensive)\b/.test(text)) return reply({ text: 'What maximum budget should I use for these pieces?', suggestions: budgetChoices }, { ...state, intent: 'catalog', stage: 'budget' });

  if (/\b(find a piece|find furniture|browse products|shop furniture)\b/.test(text)) return reply({ text: 'What are you looking for? Choose a category, or tell me something specific, like “chairs under 100k”.', suggestions: ['Seating', 'Tables', 'Lighting', 'All pieces'] }, { ...initialGuideState, intent: 'catalog', stage: 'category' });
  if (/\b(product prices|prices|how much|cost)\b/.test(text) && !category && !product && budget === undefined) return results({ ...initialGuideState, intent: 'catalog', category: 'All pieces', budget: 'all' });
  if (category && budget === undefined && /\b(prices?|cost|how much|dimensions?|size|materials?|finishes)\b/.test(text)) {
    const found = results({ ...initialGuideState, ...category, budget: 'all' });
    if (found.message.productIds.length) found.message.text = `Here are the matching pieces and their sample prices. Open a piece for its dimensions, materials and finish options. All specifications are illustrative.`;
    return found;
  }

  if (category || product || material || budget !== undefined) {
    if (state.intent !== 'catalog') state = { ...initialGuideState, intent: 'catalog' };
    if (category) state = { ...state, ...category };
    if (product) state = { ...state, category: product.category, query: product.name };
    if (material) state.material = material;
    if (budget !== undefined) state.budget = budget;
    if (!state.category && !material) return reply({ text: `I'll use ${state.budget === 'all' ? 'any budget' : money(state.budget)}. Which category would you like to explore?`, suggestions: ['Seating', 'Tables', 'Lighting', 'All pieces'] }, { ...state, stage: 'category' });
    if (state.budget == null) return reply({ text: `Let's explore ${state.query || state.category?.toLowerCase() || state.material.toLowerCase()}. Do you have a maximum budget in PKR?`, suggestions: budgetChoices }, { ...state, stage: 'budget' });
    return results(state);
  }

  if (state.stage === 'budget') return reply({ text: 'Please give a positive maximum price, like “under 80k” or “1 lakh”, or choose Any budget.', suggestions: budgetChoices });
  return reply({ text: "I can help with sample products, PKR prices, dimensions, design services and basic demo questions. I don't have an answer to that one yet. Try one of these starting points.", suggestions: startChoices });
}
