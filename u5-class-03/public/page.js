// page.js - the two functions of the page that talk to the service.

// reads: GET /api/products, and the list that comes back
async function getProducts()
{
  const reply = await fetch("/api/products");
  const list = await reply.json();
  return list;
}

// Task 3 · writes: POST /api/products, with the product in the body as JSON.
// The request goes out with no options yet, so it is a plain GET. Write the three options.
async function addProduct(product)
{
  const options = {
    // 1. method: the verb that adds
    // 2. headers: the label that says the body is JSON
    // 3. body: the product, turned into JSON text
  };
  const reply = await fetch("/api/products", options);
  return reply.status;
}
