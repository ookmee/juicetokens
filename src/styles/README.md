# JuiceTokens Styling Guide

## Font Usage

We use Google Fonts for our typography. To add a new font:

1. Add the font import to `src/styles/fonts.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Your+Font&display=swap');
```

2. Use the font in your components:
```css
.your-element {
  font-family: 'Your Font', sans-serif;
}
```

## CSS Organization

- `src/styles/` - Main styles directory
  - `fonts.css` - Font imports and font-related styles
  - `variables.css` - CSS variables and theme configuration
  - `global.css` - Global styles and resets

## Best Practices

1. Use CSS variables for consistent theming
2. Keep component-specific styles in their respective component files
3. Use Tailwind CSS utility classes when possible
4. Follow BEM naming convention for custom CSS classes

## Adding New Styles

1. For global styles, add them to the appropriate file in `src/styles/`
2. For component-specific styles, use the `<style>` block in your Svelte component
3. For utility classes, add them to the Tailwind configuration

## Example

```css
/* src/styles/variables.css */
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --font-primary: 'Your Font', sans-serif;
}

/* Component-specific styles */
.your-component {
  font-family: var(--font-primary);
  color: var(--primary-color);
}
``` 