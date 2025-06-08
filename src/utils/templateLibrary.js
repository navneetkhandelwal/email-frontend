export const templateLibrary = {
  '1': {
    name: 'Corporate Blue',
    template: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
          }
          .container { 
            max-width: 600px;
            margin: 0;
            padding: 2em 2em 2em 0.5cm;
            text-align: left;
            background: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border-radius: 8px;
          }
          p { 
            margin-bottom: 1.2em;
            padding: 0.8em;
            background: #f8fafc;
            border-radius: 4px;
          }
          .highlight { 
            color: #0066cc;
            font-weight: 600;
            border-bottom: 2px solid #0066cc;
          }
          a {
            display: inline-block;
            padding: 10px 20px;
            margin: 5px 10px 5px 0;
            background-color: #0066cc;
            color: white !important;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 500;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0,102,204,0.2);
          }
          a:hover {
            background-color: #0052a3;
            transform: translateY(-1px);
            box-shadow: 0 4px 6px rgba(0,102,204,0.3);
          }
        </style>
      </head>
      <body><div class="container"></div></body>
      </html>
    `
  },
  '2': {
    name: 'Modern Tech',
    template: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.7;
            color: #2d3748;
            margin: 0;
            padding: 0;
          }
          .container { 
            max-width: 600px;
            margin: 0;
            padding: 0 0 0 0.5cm;
            text-align: left;
          }
          p { 
            margin-bottom: 1.2em;
            font-size: 15px;
          }
          .highlight { 
            color: #4a5568;
            font-weight: 600;
            background: linear-gradient(120deg, #ebf4ff 0%, #ebf4ff 100%);
            background-repeat: no-repeat;
            background-size: 100% 0.3em;
            background-position: 0 88%;
          }
          a {
            display: inline-block;
            padding: 10px 20px;
            margin: 5px 10px 5px 0;
            background-color: #4299e1;
            color: white !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            box-shadow: 0 2px 4px rgba(66, 153, 225, 0.2);
            transition: all 0.2s ease;
          }
          a:hover {
            background-color: #3182ce;
            box-shadow: 0 4px 6px rgba(66, 153, 225, 0.3);
          }
        </style>
      </head>
      <body><div class="container"></div></body>
      </html>
    `
  },
  '3': {
    name: 'Professional Purple',
    template: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: 'SF Pro Display', -apple-system, sans-serif;
            line-height: 1.6;
            color: #111827;
            margin: 0;
            padding: 0;
          }
          .container { 
            max-width: 600px;
            margin: 0;
            padding: 0 0 0 0.5cm;
            text-align: left;
          }
          p { 
            margin-bottom: 1.2em;
            font-size: 15px;
          }
          .highlight { 
            color: #7C3AED;
            font-weight: 600;
          }
          a {
            display: inline-block;
            padding: 12px 24px;
            margin: 5px 10px 5px 0;
            background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%);
            color: white !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(124, 58, 237, 0.2);
          }
          a:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 8px rgba(124, 58, 237, 0.3);
          }
          .tech-skills {
            display: inline-block;
            padding: 6px 12px;
            margin: 4px;
            background-color: #f3f4f6;
            border-radius: 6px;
            font-size: 14px;
            color: #4b5563;
          }
          .experience ul {
            padding-left: 1.5em;
          }
          .experience li {
            margin-bottom: 0.8em;
          }
          hr {
            border: none;
            border-top: 1px solid #e5e7eb;
            margin: 2em 0;
          }
        </style>
      </head>
      <body><div class="container"></div></body>
      </html>
    `
  },
  '4': {
    name: 'Minimal Dark',
    template: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: 'Inter', -apple-system, sans-serif;
            line-height: 1.6;
            color: #e5e7eb;
            margin: 0;
            padding: 0;
            background-color: #111827;
          }
          .container { 
            max-width: 600px;
            margin: 0;
            padding: 0 0 0 0.5cm;
            text-align: left;
          }
          p { 
            margin-bottom: 1.2em;
            font-size: 15px;
          }
          .highlight { 
            color: #8b5cf6;
            font-weight: 600;
          }
          a {
            display: inline-block;
            padding: 12px 24px;
            margin: 5px 10px 5px 0;
            background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
            color: white !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(139, 92, 246, 0.2);
          }
          a:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 8px rgba(139, 92, 246, 0.3);
          }
          .tech-skills {
            display: inline-block;
            padding: 6px 12px;
            margin: 4px;
            background-color: #374151;
            border-radius: 6px;
            font-size: 14px;
            color: #d1d5db;
          }
          .experience ul {
            padding-left: 1.5em;
          }
          .experience li {
            margin-bottom: 0.8em;
          }
          hr {
            border: none;
            border-top: 1px solid #374151;
            margin: 2em 0;
          }
        </style>
      </head>
      <body><div class="container"></div></body>
      </html>
    `
  },
  '5': {
    name: 'Elegant Green',
    template: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: 'Georgia', serif;
            line-height: 1.8;
            color: #1a202c;
            margin: 0;
            padding: 0;
            background-color: #f0fdf4;
          }
          .container { 
            max-width: 600px;
            margin: 0;
            padding: 0 0 0 0.5cm;
            text-align: left;
          }
          p { 
            margin-bottom: 1.2em;
            font-size: 16px;
          }
          .highlight { 
            color: #059669;
            font-weight: 600;
            border-bottom: 2px solid #059669;
          }
          a {
            display: inline-block;
            padding: 12px 24px;
            margin: 5px 10px 5px 0;
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            color: white !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(5, 150, 105, 0.2);
          }
          a:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 8px rgba(5, 150, 105, 0.3);
          }
          .tech-skills {
            display: inline-block;
            padding: 6px 12px;
            margin: 4px;
            background-color: #dcfce7;
            border-radius: 6px;
            font-size: 14px;
            color: #065f46;
          }
          .experience ul {
            padding-left: 1.5em;
          }
          .experience li {
            margin-bottom: 0.8em;
          }
          hr {
            border: none;
            border-top: 1px solid #bbf7d0;
            margin: 2em 0;
          }
        </style>
      </head>
      <body><div class="container"></div></body>
      </html>
    `
  }
}; 