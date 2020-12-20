// Utility query methods
let qs = q => document.querySelector(q);
let qsa = q => Array.from(document.querySelectorAll(q));

// Find the application/ld+json
let scripts = qsa('script[type="application/ld+json"]');
let host = location.host.replaceAll(/^www\./g, '');
let data;

loop:
for (let script of scripts) {
  try {
    // Try to parse each script as json
    let json = JSON.parse(script.innerHTML);
    
    console.log('Parsed script', json);
    
    if (Array.isArray(json['@type'])) {
      json['@type'] = json['@type'][0];
    }
    
    if ((!json['@type'] || json['@type'].toLowerCase() !== 'recipe') && json['@graph']) {
      json = json['@graph'];
    }
    
    // Ensure it's an array
    if (!Array.isArray(json)) {
      json = [json];
    }
    
    // Find the recipe schema
    for (let schema of json) {
      console.log('Checking schema', schema);
      
      // Ensure @type is not an array
      if (Array.isArray(schema['@type'])) {
        schema['@type'] = schema['@type'][0];
      }
      
      if (schema['@type'].toLowerCase() === 'recipe') {
        console.log('Recipe found', schema);
        
        // Ensure formats
        if (Array.isArray(schema.image)) {
          let first = schema.image[0];
          schema.image = first.url || first;
        } else {
          schema.image = schema.image.url || schema.image;
        }
        
        if (!Array.isArray(schema.recipeInstructions)) {
          schema.recipeInstructions = [{text: schema.recipeInstructions}];
        }
        
        data = schema;
        break loop;
      }
    }
  } catch (e) {
    console.log(e);
  }
}

// Exceptions for sites
if (data) {
  switch (host) {

    case 'delish.com':
    // https://www.delish.com/cooking/recipe-ideas/a28626172/how-to-cook-boneless-chicken-thigh-oven-recipe/
    data.recipeInstructions =
    qsa('div[class="direction-lists"] li')
    .map(el => ({ text: el.innerText }));
    break;

  }
} else {
  switch (host) {

    case 'epicurious.com':
    data = {
      name: qs('h1[itemprop="name"]').innerText,
      description: '',
      image: qs('img[srcset].photo').srcset,
      recipeIngredient:
        qsa('li[itemprop="ingredients"]')
        .map(el => el.innerText),
      recipeInstructions:
        qsa('li.preparation-step')
        .map(el => ({text: el.innerText}))
    };
    break;

  }
}

if (data) {
  // Remove markup in ingredients
  data.recipeIngredient = data.recipeIngredient.map(
    i => i.replaceAll(/<.+?>/g, ' ')
  );

  // Remove leading step numbers in instructions
  data.recipeInstructions = data.recipeInstructions.map(
    i => ({
      text: i.text.replace(/^\d+\.\s*?/, '')
    })
  );
  
  // Render the recipe
  document.body.innerHTML =
`
<div class="recipe-image">
<img src="${data.image}" alt="An image of ${data.name}" />
</div>
<h1>${data.name}</h1>
${data.description ? `<p><i>${data.description}</i></p>` : ''}

<h2>Ingredients</h2>

<ul class="ingredients-list">
${data.recipeIngredient.reduce((prev, curr) => prev +
  `<li>${curr}</li>`
  , '')}
  </ul>
  
  <h2>Directions</h2>
  
  <ol style="margin:0.125in; padding:0; overflow: visible; display: block">
  ${data.recipeInstructions.reduce((prev, curr) => prev +
    `<li>${curr.text}<br></li>`
    , '')}
  </ol>
  
  <a href="${window.location}">${window.location}</a>
  `;


  // Clear all the styles
  qsa('style, link[rel="stylesheet"]')
  .map(el => el.parentNode.removeChild(el));

  
  // Add custom styles
  document.head.insertAdjacentHTML('beforeend',
`
<style type="text/css">
* {
  box-sizing: border-box;
}
:root, html, body {
  background: #f2f2f2;
  color: #444444;
  text-shadow: 0 1px 0 #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.6181;
  margin: 0;
  padding: 0;
  height: 100%; /* Fallback */
  height: 100vh;
  width: 100%; /* Fallback */
  width: 100vw;
}

body {
  margin: 1rem auto;
  width: 90%;
}

h1 {
  font-size: 2rem;
}

p {
  font-size: 1rem;
}

a {
  color: #444444;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

nav.nav {
  text-align: right;
  font-size: 0.6875rem; /* 11px */
}

@media screen and (min-width: 480px) {
  body {
    max-width: 800px;
  }
}
@media screen and (min-width: 660px) {
  .supported-list {
    columns: 2;
  }
}
@media screen and (min-width: 980px) {
  .supported-list {
    columns: 3;
  }
}
@media screen and (min-width: 1220px) {
  :root, html, body {
    font-size: 18px;
  }
  body {
    max-width: 1000px;
  }
}

a {
  border-bottom: 1px solid #444444;
  color: #444444;
  text-decoration: none;
}
a:hover {
  border-bottom: 0;
}

.recipe-image {
  font-size: 0;
}

.recipe-image img {
  width: 100%;
}

li {
  -webkit-column-break-inside: avoid;
  page-break-inside: avoid;
  break-inside: avoid;
}

.ingredients-list {
  columns: 1;
  padding-left: 2rem;
}

@media screen and (min-width: 480px) {
  .recipe-image {
    float: right;
    margin: 0.75rem;
  }
  .recipe-image img {
    width: 250px;
  }
}
@media screen and (min-width: 660px) {
  .ingredients-list {
    columns: 2;
  }
}
@media screen and (min-width: 1220px) {
  .ingredients-list {
    columns: 3;
  }
}

/* Print styles */
@media print {
  @page {
    size: 6in 4in landscape;
    margin: 0.125in;
  }
  body {
    color: black;
    width: 6in;
    height: 4in;
    margin: 0.125in;
    font-size: 9pt;
    line-height: 1.2;
    overflow: visible;
    font-family: Helvetica, sans-serif;
  }
  h1 {
    font-size: 10pt;
    font-weight: bold;
  }
  h2 {
    display: none;
  }
  img {
    display: none;
  }
  a {
    color: black;
    text-decoration: none
  }
  body {
    margin: 0;
    padding: 0;
    max-width: auto;
    width: 100%;
  }
  .ingredients-list {
    columns: 3;
    column-gap: 0.2in;
    padding-left: 0.125in;
  }
}
</style>
`);
} else {
  console.log(`No recipe found in ${scripts.length} scripts`);
}
