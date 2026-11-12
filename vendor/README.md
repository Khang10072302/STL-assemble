# vendor

`three-bundle.js` là bản gói sẵn (three.js r160 và các thư viện phụ) để các file trong `js/` dùng được như script thường. Bạn không cần sửa file này.

Muốn tạo lại hoặc nâng phiên bản, chạy trong thư mục này:

```bash
npm init -y
npm i three@0.160.0 esbuild
npx esbuild entry.js --bundle --minify --format=iife --outfile=three-bundle.js
```

`entry.js` liệt kê các thư viện được gói và gắn chúng vào `window`.
