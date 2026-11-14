# STL Assembler

Web để thả nhiều file STL, 3MF hoặc STEP vào, ghép các phần lại với nhau và thử màu ngay trên trình duyệt. Không cần chuyển mesh sang solid.

## Chạy thử

Mở `index.html` bằng trình duyệt là chạy được, không cần cài gì và không cần server. Thư viện three.js đã được gói sẵn trong `vendor/three-bundle.js`, nên chỉ riêng việc đọc file STEP là cần internet (thư viện đọc STEP được tải từ CDN ở lần mở STEP đầu tiên). Trong VS Code bạn cũng có thể dùng extension **Live Server**.

## Cách dùng

- **Bố cục:** thanh trên có *Mở dự án*, *Lưu*, *Xuất ảnh*. Bảng *Chi tiết* bên trái (thêm file, nhóm, danh sách chi tiết), khung nhìn 3D ở giữa (thanh công cụ Dời/Xoay/Co giãn, hoàn tác, chế độ nhìn, khối điều hướng và thanh số liệu phía dưới), bảng *Thuộc tính* bên phải với 4 tab: Chất liệu, Ghép, Căn chỉnh, Tách rời.
- **Lưới nền và zoom:** ở thanh số liệu phía dưới khung nhìn, tắt công tắc *Lưới* để ẩn lưới (tính năng *Dính mặt phẳng* vẫn hoạt động như cũ). Thanh *Tốc độ zoom* nằm trong menu *Trực giao* ở góc trên bên phải khung nhìn và chỉnh độ nhạy khi lăn chuột hoặc vuốt touchpad, mặc định 4 và zoom hướng về vị trí con trỏ.
- **Lưu và mở project:** nút *Lưu* ở thanh trên (Ctrl+S) tải về một file `.stlproj` chứa cả hình học, vị trí, màu, chất liệu, nhóm, ổ khóa, mối ghép và góc nhìn hiện tại. Mở lại bằng nút *Mở dự án* hoặc kéo file vào trang, mọi thứ trở lại đúng như lúc lưu để bạn đổi màu hay chỉnh tiếp. Đây là file zip riêng của web (không mở được bằng phần mềm CAD). Muốn đưa ra phần mềm khác thì dùng file gốc STL/3MF.
- **Xóa:** phím Delete (hoặc Backspace trên Mac) xóa tất cả phần đang chọn trong một lần, có thể hoàn tác. Phần bị khóa sẽ được giữ lại.
- **Thao tác hàng loạt:** khi đang chọn nhiều phần, bấm ổ khóa, ô màu, ô ẩn/hiện hoặc nút × trên một phần trong vùng chọn thì áp dụng cho tất cả các phần được chọn. Các nút chất liệu, bảng màu filament và ô *Dính mặt phẳng* cũng vậy.
- **Khối điều hướng (giống FreeCAD):** ở góc trên bên phải khung nhìn. Bấm vào một mặt (TOP, FRONT, RIGHT…) để nhìn thẳng vào mặt đó, bấm vào dải cạnh để nhìn chéo giữa hai mặt, bấm vào ô góc để nhìn từ góc giữa ba mặt (tổng cộng 26 hướng). Rê chuột sẽ tô sáng vùng sẽ được chọn. Bốn mũi tên xoay 15° mỗi lần bấm, chấm tròn nhỏ là góc đẳng cự (isometric), hình khối nhỏ ở dưới là căn khung nhìn. Hệ trục X (đỏ), Y (xanh lá), Z (xanh dương) nằm ở góc dưới bên trái khối.
- **Xuất ảnh:** nút *Xuất ảnh* ở thanh trên mở một menu nhỏ: chọn độ phân giải (1×, 2×, 3× so với khung nhìn hiện tại) rồi bấm *Tải ảnh PNG*. Có thể bật nền trong suốt. Gizmo, chấm đánh dấu và (nếu chọn) lưới sẽ được ẩn khỏi ảnh.
- **Tách rời (exploded view):** mở tab *Tách rời* ở bảng Thuộc tính, kéo thanh *Mức tách* để các phần tách ra xa nhau. Chọn kiểu *Tỏa ra từ tâm* hoặc tách dọc một trục (X, Y, Z). Vị trí ghép thật không bị đổi, kéo về 0 là về lại như cũ. Khi đang tách, việc chỉnh sửa và hoàn tác tạm bị khóa; đổi màu và chất liệu vẫn dùng được, và ảnh xuất ra giữ nguyên trạng thái tách.
- **Thêm phần:** bấm *Chọn file STL / 3MF / STEP* hoặc kéo thả nhiều file vào trang. File 3MF có nhiều vật thể thì mỗi vật thể thành một phần riêng, vẫn giữ vị trí tương đối như trong file và lấy màu từ file nếu có.
- **File STEP (.step, .stp):** web dùng thư viện occt-import-js (WebAssembly, tải từ CDN ở lần mở STEP đầu tiên, cần internet) để chia nhỏ bề mặt STEP thành lưới tam giác. Mỗi thân (body) trong file STEP thành một phần riêng, nên ghép lắp ráp từ STEP rất tiện. Bản thân phần đó vẫn là mesh, không phải solid, và mất thông tin CAD như đường kính lỗ.
- **Dính mặt phẳng:** mặc định mỗi phần mới đều dính mặt phẳng, nghĩa là điểm thấp nhất của nó luôn chạm lưới (Z = 0), kể cả khi bạn dời hoặc xoay. Muốn nhấc lên hoặc đặt chồng lên phần khác thì bỏ tích *Dính mặt phẳng* cho phần đó (hoặc *Tắt tất cả*). Phần được ghép bằng chế độ Điểm/Mặt/Cạnh sẽ tự tắt dính. Với file 3MF, phần nào đang lơ lửng trong file thì không bị dính.
- **Dời / xoay / co giãn:** chọn phần, rồi dùng gizmo trên màn hình. Phím tắt W, E, R. Bật *Bám lưới* để di chuyển theo bước 5 đơn vị và xoay theo bước 15°.
- **Nhập số chính xác:** sửa X, Y, Z, góc xoay và tỉ lệ ở thanh số liệu phía dưới khung nhìn.
- **Ghép:** chọn chế độ *Điểm*, *Mặt* hoặc *Cạnh*, bấm một vị trí trên phần đang chọn, rồi bấm vị trí tương ứng trên phần khác. *Điểm*: hai điểm trùng nhau (tự hít vào đỉnh gần nhất). *Mặt*: hai mặt úp vào nhau và áp sát, bạn tự trượt trên mặt phẳng. *Cạnh*: hai cạnh song song và nằm trên cùng một đường. Esc để hủy.
- **Mối ghép:** mỗi lần ghép tạo một chấm xanh tại chỗ ghép và một dòng trong danh sách *Mối ghép*. Tích *Dính* thì các phần đã ghép di chuyển cùng nhau; bỏ tích hoặc bấm × để tách ra.
- **Chọn nhiều phần:** giữ Shift hoặc Ctrl rồi bấm vào các phần (trên khung nhìn hoặc trong danh sách), hoặc bấm *Chọn tất cả*. Khi chọn nhiều phần, kéo gizmo sẽ dời cả nhóm cùng lúc.
- **Căn chỉnh (Align, giống Tinkercad):** chọn từ 2 chi tiết trở lên rồi mở tab *Căn chỉnh*: chọn trục X/Y/Z và bấm *Đầu*, *Giữa* hoặc *Cuối* để căn ngay. Nút *Bật căn chỉnh* (hoặc phím L) hiện hộp bao và các chấm trên khung nhìn. Một hộp bao xanh hiện quanh các phần được chọn cùng 9 chấm: hàng đỏ cho trục X, xanh lá cho Y, xanh dương cho Z, mỗi trục có 3 chấm Min, Giữa, Max. Bấm một chấm thì tất cả các phần được căn theo mép tương ứng của hộp bao, ví dụ chấm X đầu tiên căn mép trái của mọi phần về mép trái ngoài cùng. Các nút Đầu/Giữa/Cuối trong tab làm đúng việc đó nếu bạn không muốn bấm chấm. Căn theo trục Z sẽ tự tắt *Dính mặt phẳng* của các phần bị dời.
- **Nhóm (Group):** chọn từ 2 phần trở lên rồi bấm *Gộp nhóm* (Ctrl+G). Nhóm hiện trong danh sách *Các phần* dưới dạng một dòng có nút thu gọn/mở rộng, các phần bên trong thụt vào. Bấm tên nhóm để chọn cả nhóm (bấm đúp để đổi tên), bấm vào một phần trên khung nhìn cũng chọn cả nhóm, giữ Alt để chọn riêng một phần. Nút ⤢ hoặc *Tách nhóm* (Ctrl+Shift+G) để rã nhóm. Khi căn chỉnh, một nhóm được chọn đủ sẽ được coi là một vật.
- **Khóa (lock):** mỗi phần và mỗi nhóm có ổ khóa trong danh sách: khóa mở màu trắng, khóa đóng màu đỏ. Phần bị khóa không thể dời, xoay, co giãn, ghép, xóa hoặc bị kéo theo cùng nhóm đang chọn. Khi căn chỉnh có phần bị khóa, các phần đó là mốc (hộp bao và các chấm tính theo chúng) và chỉ các phần không khóa được dời.
- **Chọn vùng:** giữ Shift và kéo chuột để vẽ khung chọn. Kéo từ trái sang phải thì chọn các phần nằm trọn trong khung, kéo từ phải sang trái thì chọn cả các phần chạm khung. Phần mới chọn được thêm vào phần đang chọn.
- **Trực giao (isometric):** mặc định web nhìn theo kiểu trực giao (không có phối cảnh) từ hướng isometric. Menu *Trực giao* ở góc trên bên phải khung nhìn chuyển qua lại với chế độ phối cảnh.
- **Hoàn tác / làm lại:** hai nút ở giữa thanh công cụ phía trên khung nhìn, hoặc Ctrl+Z / Ctrl+Y.
- **Chất liệu:** ở tab *Chất liệu*, chọn chi tiết rồi chọn trong danh sách *Vật liệu* (PLA, PETG, Nhựa mờ, Silk, Kim loại, Trong suốt). Các chất liệu chỉ khác nhau về độ bóng, ánh kim và độ trong để bạn hình dung, không phải render chính xác. Phần *Màu sắc* bên dưới là bảng màu filament. Bấm ô *+* để thêm màu mới. Khi đang chọn phần nào đó, bấm một màu để tô, bấm lần nữa vào chính màu đó để mở menu sửa màu (có nút *Xóa màu*); khi chưa chọn phần nào thì bấm một lần là mở menu. Bảng màu được lưu trong trình duyệt nên lần sau mở lại vẫn còn.
- **Đổi màu:** bấm ô màu cạnh tên từng phần. Dấu tích để ẩn/hiện, dấu × để xóa.

Trục Z hướng lên (giống FreeCAD). Đơn vị là đơn vị gốc trong file STL.

## Cấu trúc code

Mỗi chức năng nằm trong một file nhỏ, nên khi cần sửa chỉ cần mở đúng file. Các file `js/*.js` là script thường, dùng chung phạm vi toàn cục, và được nạp theo đúng thứ tự trong bảng dưới (cũng là thứ tự các thẻ `<script>` trong `index.html`). Mỗi file có một dòng mô tả ngay đầu file.

| File | Chức năng |
|---|---|
| `index.html` | Giao diện (HTML) và danh sách các thẻ script |
| `css/style.css` | Toàn bộ kiểu giao diện |
| `vendor/three-bundle.js` | three.js, OrbitControls, TransformControls, STLLoader, RoomEnvironment, fflate gói sẵn (xem `vendor/README.md`) |
| `js/core.js` | Lõi: cảnh 3D, camera, renderer, ánh sáng, lưới, OrbitControls, TransformControls, biến trạng thái chung, vòng lặp vẽ |
| `js/ui.js` | Giao diện: biểu tượng SVG, tab bảng Thuộc tính, menu nổi, nhãn khung nhìn, thẻ chi tiết đang chọn |
| `js/view.js` | Khung nhìn: căn khung (frame), chế độ trực giao/phối cảnh, ẩn/hiện lưới nền, tốc độ zoom |
| `js/viewcube.js` | Khối điều hướng kiểu FreeCAD (6 mặt, 12 cạnh, 8 góc), mũi tên xoay, hệ trục X/Y/Z |
| `js/import-stl.js` | Tạo phần từ lưới STL: tính điểm thấp nhất, đưa tâm về gốc, xếp vị trí các phần mới |
| `js/import-3mf.js` | Đọc file 3MF (zip + XML, hỗ trợ file nhiều lớp của Bambu/Prusa) |
| `js/import-step.js` | Đọc file STEP bằng occt-import-js (WebAssembly, tải từ CDN khi cần) |
| `js/import-files.js` | Chọn file / kéo thả file, gọi đúng bộ đọc theo đuôi file (.stl, .3mf, .step, .stp) |
| `js/selection.js` | Chọn phần: chọn một, chọn thêm (Shift/Ctrl), chọn nhóm, đồng bộ gizmo, targets() cho thao tác hàng loạt |
| `js/lock.js` | Khóa (lock): kiểm tra khóa, biểu tượng ổ khóa, bật/tắt gizmo theo khóa |
| `js/groups.js` | Nhóm (group): gộp nhóm, tách nhóm, gom các phần thành đơn vị để căn chỉnh |
| `js/list.js` | Danh sách các phần (có nhóm, ổ khóa, màu, ẩn/hiện); thao tác trên một phần đang chọn áp dụng cho cả vùng chọn |
| `js/delete.js` | Xóa phần: Delete/Backspace xóa mọi phần đang chọn (phần bị khóa được giữ lại) |
| `js/movement.js` | Di chuyển cả nhóm: beginMove, groupOf, propagate (các phần chọn cùng và các phần dính cùng đi theo) |
| `js/history.js` | Hoàn tác / làm lại (snapshot vị trí, màu, chất liệu, khóa, nhóm, mối ghép) |
| `js/inputs.js` | Bảng nhập số X/Y/Z, góc xoay, tỉ lệ |
| `js/transform.js` | Chế độ dời/xoay/co giãn của gizmo và bám lưới |
| `js/keys.js` | Phím tắt (W/E/R, L, Delete, Esc, Ctrl+Z/Y/G) |
| `js/align.js` | Căn chỉnh (Align) kiểu Tinkercad: hộp bao, chấm Min/Giữa/Max, nút căn |
| `js/boxselect.js` | Chọn vùng bằng Shift + kéo chuột (trái sang phải: nằm trọn, phải sang trái: chạm) |
| `js/stick.js` | Dính mặt phẳng: đáy luôn chạm lưới, bật/tắt từng phần hoặc tất cả |
| `js/explode.js` | Exploded view: tách các phần ra xa nhau để xem cấu trúc bên trong |
| `js/export.js` | Xuất ảnh PNG (độ phân giải, nền trong suốt, ẩn lưới) |
| `js/materials.js` | Chất liệu in 3D (PLA, PETG, Matte, Silk, Metallic, Clear) và bảng màu filament |
| `js/snap.js` | Ghép theo điểm / mặt / cạnh, mối ghép (joint) và danh sách mối ghép |
| `js/project.js` | Lưu / mở project .stlproj (hình học, vị trí, màu, chất liệu, nhóm, khóa, mối ghép, góc nhìn) |
| `js/main.js` | Khởi động: chạy sau khi mọi file chức năng đã nạp |

Quy ước khi thêm chức năng mới: tạo `js/ten-chuc-nang.js`, thêm một thẻ `<script>` vào `index.html` trước `js/main.js`, và chỉ khởi tạo (gắn sự kiện) trong chính file đó. Nếu cần gọi hàm của file khác thì gọi lúc chạy (trong hàm), đừng gọi ngay khi file được nạp, trừ khi file đó nằm trước trong danh sách.

## Đưa lên GitHub

```bash
git init
git add .
git commit -m "STL Assembler"
git branch -M main
git remote add origin https://github.com/Khang10072302/stl-assembler.git
git push -u origin main
```

Để có link chạy trực tiếp: trong repo vào **Settings → Pages**, chọn nhánh `main`, thư mục `/ (root)`, rồi Save.
