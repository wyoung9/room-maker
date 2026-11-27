/*
  방 만들기 — 언어 전환 (한국어 · English · 日本語 · 中文)

  ● 사이트의 모든 글자는 아래 K("키", 한국어, English, 日本語, 中文) 줄에 모여 있어요.
    글을 바꾸고 싶으면 해당 줄의 따옴표 안만 고치세요. (따옴표와 쉼표는 지우지 마세요.)
  ● {n}, {w} 처럼 중괄호로 감싼 부분은 숫자·이름이 들어갈 자리예요. 그대로 두세요.
  ● 새 언어를 넣으려면 LANGS 에 한 줄을 더하고, 모든 K 줄 끝에 번역을 하나씩 더하면 됩니다.
  ● 고른 언어는 이 기기의 브라우저에 기억돼요. 주소 뒤에 ?lang=en 처럼 붙이면 그 언어로 열려요(확인용).

  HTML 쪽 표시 방법
    data-i18n="키"            → 그 글자로 바꿈
    data-i18n-html="키"       → 굵은 글씨·줄바꿈이 들어간 글(HTML)로 바꿈
    data-i18n-attr="속성:키;속성:키" → placeholder, aria-label, alt, title, content 같은 속성을 바꿈
*/
(function () {
  "use strict";

  var LANGS = [["ko", "한국어", "KO"], ["en", "English", "EN"], ["ja", "日本語", "JA"], ["zh", "中文", "中"]];
  var STORE = "roommaker.lang";
  var CFG = window.ROOM_CONFIG || {};

  var D = { ko: {}, en: {}, ja: {}, zh: {} };
  function K(key, ko, en, ja, zh) { D.ko[key] = ko; D.en[key] = en; D.ja[key] = ja; D.zh[key] = zh; }

  /* ===================== 공통 (메뉴 · 바닥글) ===================== */
  K("brand", "방 만들기", "Room Maker", "部屋づくり", "布置房间");
  K("nav.place", "배치", "Layout", "配置", "布局");
  K("nav.render", "AI 렌더", "AI Render", "AIレンダー", "AI 渲染");
  K("cta.place", "무료로 배치하기", "Try it free", "無料で配置する", "免费布置");
  K("footer.pilot", "시범 운영 중", "Pilot in progress", "試験運用中", "试运营中");
  K("lang.label", "언어 선택", "Language", "言語", "语言");

  /* ===================== 첫 화면 (index.html) ===================== */
  K("meta.index",
    "이사 전에 가구 배치와 방 분위기를 미리 보고, 사기 전에 방에 들어가는지 확인하세요.",
    "See your furniture layout and room mood before you move, and check it fits before you buy.",
    "引っ越し前に家具の配置と部屋の雰囲気を確かめて、買う前に部屋に入るか確認しましょう。",
    "搬家前先预览家具布局和房间氛围，购买前确认是否放得下。");
  K("hero.label", "이사 전 가구 배치 미리보기", "Preview your furniture layout before moving", "引っ越し前の家具配置プレビュー", "搬家前预览家具布局");
  K("hero.h1",
    "<span class='u wave'>침대</span> 놓고 <span class='u dash'>책상</span>까지<br>놓을 <span class='u wave'>자리</span>가 있을까?",
    "Is there <span class='u wave'>room</span> for a <span class='u dash'>bed</span><br>and a <span class='u wave'>desk</span> too?",
    "<span class='u wave'>ベッド</span>を置いて<span class='u dash'>机</span>まで<br>置ける<span class='u wave'>場所</span>はある？",
    "放了<span class='u wave'>床</span>，还有<span class='u dash'>书桌</span>的<br><span class='u wave'>位置</span>吗？");
  K("hero.lead",
    "이사 전에 가구 배치를 직접 해 보고, 사기 전에 방에 들어가는지 확인하세요. 완성된 분위기는 AI 렌더로 미리 볼 수 있어요.",
    "Try arranging furniture yourself before you move, and check it fits before you buy. See the finished mood in advance with an AI render.",
    "引っ越し前に家具を自分で配置してみて、買う前に部屋に入るか確認しましょう。完成した雰囲気はAIレンダーで先に見られます。",
    "搬家前亲手摆放家具，购买前确认能否放进房间。完成后的氛围可以用 AI 渲染提前看到。");
  K("hero.cta1", "무료로 배치 시작하기", "Start laying out for free", "無料で配置を始める", "免费开始布置");
  K("hero.cta2", "AI 렌더 알아보기", "Learn about AI Render", "AIレンダーを見る", "了解 AI 渲染");
  K("pilot", "지금은 시범 운영 중이에요. AI 렌더는 처음 {n}회 무료예요.",
    "We're in a pilot phase. The first {n} AI renders are free.",
    "現在は試験運用中です。AIレンダーは最初の{n}回が無料です。",
    "目前处于试运营阶段。AI 渲染前 {n} 次免费。");

  K("case.label", "방 만들기는", "About Room Maker", "部屋づくりとは", "关于房间布置");
  K("case.h2",
    "방 크기를 넣고,<br>가구를 끌어다 놓아 보세요",
    "Enter your room size,<br>then drag in your furniture",
    "部屋の広さを入力して、<br>家具をドラッグして置いてみましょう",
    "输入房间尺寸，<br>再把家具拖进去试试");
  K("case.intro",
    "이사 전에 가구가 들어가는지 먼저 놓아 볼 수 있는 배치 도구예요. 횟수 제한 없이 무료이고, 회원가입 없이 바로 쓸 수 있어요.",
    "A layout tool for testing whether furniture fits before you move. It's free with no limits, and you can use it right away without signing up.",
    "引っ越し前に家具が入るかどうか先に置いて試せる配置ツールです。回数制限なしで無料、会員登録なしですぐ使えます。",
    "搬家前可以先试摆家具、看看放不放得下的布局工具。不限次数、免费，无需注册即可使用。");
  K("case.s1.t", "방 크기 입력", "Enter room size", "部屋の広さを入力", "输入房间尺寸");
  K("case.s1.pill", "무료", "Free", "無料", "免费");
  K("case.s1.d",
    "가로·세로 길이(cm)만 넣으면 방이 그려져요. 면적과 평수도 바로 보여요.",
    "Enter just the width and length (cm) and the room is drawn. The area in m² and pyeong appears right away.",
    "横と縦の長さ（cm）を入れるだけで部屋が描かれます。面積と坪数もすぐ表示されます。",
    "只要输入长宽（cm），房间就会画出来。面积和坪数也会立即显示。");
  K("case.s2.t", "가구 배치", "Arrange furniture", "家具の配置", "布置家具");
  K("case.s2.pill", "무제한", "Unlimited", "無制限", "不限次数");
  K("case.s2.d",
    "가구를 끌어다 놓아 보세요. 겹치거나 방 밖으로 나가면 색으로 알려 드려요.",
    "Drag furniture into place. If pieces overlap or go outside the room, we flag it with colors.",
    "家具をドラッグして置いてみましょう。重なったり部屋の外に出たりすると色でお知らせします。",
    "把家具拖进房间。重叠或超出房间时会用颜色提示。");
  K("case.svg",
    "300×400cm 방에 책상, 의자, 침대, 옷장을 놓은 배치도 예시",
    "Example layout: a desk, chair, bed and wardrobe in a 300×400 cm room",
    "300×400cmの部屋に机、椅子、ベッド、ワードローブを置いた配置図の例",
    "300×400cm 房间里摆放书桌、椅子、床和衣柜的布局示例");
  K("sv.desk", "책상", "Desk", "机", "书桌");
  K("sv.bed", "침대", "Bed", "ベッド", "床");
  K("sv.wardrobe", "옷장", "Wardrobe", "ワードローブ", "衣柜");
  K("sv.door1", "문 열리는", "Door", "ドアが開く", "开门");
  K("sv.door2", "자리", "swing", "スペース", "空间");
  K("sv.door", "문 90 cm", "Door 90 cm", "ドア 90 cm", "门 90 cm");
  K("case.lg1", "가구", "Furniture", "家具", "家具");
  K("case.lg2", "창문", "Window", "窓", "窗户");
  K("case.lg3", "문이 열리는 자리", "Door swing area", "ドアが開く場所", "开门空间");
  K("case.cap",
    "예시: 300×400cm 방 · 격자 1칸 = 50cm · 가구 크기는 흔한 예시 규격",
    "Example: 300×400 cm room · 1 grid square = 50 cm · furniture sizes are common example sizes",
    "例：300×400cmの部屋 · 方眼1マス＝50cm · 家具のサイズは一般的な例の規格",
    "示例：300×400cm 房间 · 1 格 = 50cm · 家具尺寸为常见示例规格");

  K("ai.p",
    "배치한 도면으로 AI가 완성된 방의 분위기 이미지를 바로 만들어 줘요. 방 사진을 올리면 그 방의 느낌도 반영해요. 처음 {n}회는 무료예요. 렌더 이미지는 AI가 그린 참고용 시안이라 실제 제품의 색·질감과 다를 수 있어요.",
    "From your layout, AI instantly creates a mood image of the finished room. Upload a room photo and it reflects that room's feel too. The first {n} renders are free. Render images are AI-drawn references, so colors and textures may differ from the real products.",
    "配置した図面から、AIが完成した部屋の雰囲気画像をすぐに作ります。部屋の写真をアップロードすると、その部屋の雰囲気も反映します。最初の{n}回は無料です。レンダー画像はAIが描いた参考用の下絵なので、実際の製品の色や質感と異なることがあります。",
    "AI 会根据您布置好的平面图，立即生成完成后房间的氛围图。上传房间照片，还能反映出那个房间的感觉。前 {n} 次免费。渲染图是 AI 绘制的参考草图，颜色和质感可能与真实产品不同。");
  K("ai.btn", "렌더 알아보기", "Learn about renders", "レンダーを見る", "了解渲染");

  K("needs.h2",
    "이사를 앞둔 분들은<br>이렇게 느낀다고 생각해요",
    "We think people about to move<br>feel like this",
    "引っ越しを控えた方は、<br>こう感じていると考えています",
    "我们认为即将搬家的人<br>会有这样的感受");
  K("needs.tag", "가정 · 인터뷰로 확인하기 전", "Assumption · not yet checked by interviews", "仮説 · インタビューで確認する前", "假设 · 尚未通过访谈验证");
  K("needs.1", "가구를 어디에 둘지, 들어갈지 감이 안 와요.",
    "I can't tell where to put furniture, or whether it will fit.",
    "家具をどこに置くか、入るのか見当がつきません。",
    "不知道家具该放哪里，也不知道放不放得下。");
  K("needs.2", "치수 재는 게 번거로워요.", "Measuring is a hassle.", "寸法を測るのが面倒です。", "量尺寸太麻烦了。");
  K("needs.3", "완성된 분위기가 상상이 안 돼서, 사고 나서 후회할까 봐 걱정돼요.",
    "I can't picture the finished mood, and I worry I'll regret it after buying.",
    "完成した雰囲気が想像できなくて、買ってから後悔しないか心配です。",
    "想象不出完成后的氛围，担心买了以后会后悔。");
  K("needs.who", "고객의 말 (가정)", "Customer's words (assumption)", "お客様の声（仮説）", "顾客的话（假设）");

  K("dark.label", "무료 시범 운영 중", "Free pilot in progress", "無料試験運用中", "免费试运营中");
  K("dark.h2",
    "곧 이사하시나요?<br>먼저 놓아 보고 결정하세요.",
    "Moving soon?<br>Try it out first, then decide.",
    "もうすぐ引っ越しですか？<br>先に置いてみてから決めましょう。",
    "快要搬家了吗？<br>先摆一摆再决定。");
  K("dark.p",
    "배치는 무료로 바로 해 볼 수 있어요. 완성된 분위기가 궁금하면 AI 렌더로 바로 만들어 보세요. 처음 {n}회는 무료예요.",
    "You can try the layout for free right away. Curious about the finished mood? Make it now with an AI render. The first {n} are free.",
    "配置は無料ですぐに試せます。完成した雰囲気が気になったら、AIレンダーですぐ作ってみましょう。最初の{n}回は無料です。",
    "布局可以马上免费试用。想看完成后的氛围，就用 AI 渲染立刻生成。前 {n} 次免费。");
  K("dark.btn2", "AI 렌더 만들어 보기", "Make an AI render", "AIレンダーを作ってみる", "生成 AI 渲染");

  K("faq.label", "자주 묻는 질문", "FAQ", "よくある質問", "常见问题");
  K("faq.big", "궁금한 점을<br>모아 봤어요", "Answers to what<br>you might be wondering", "気になる点を<br>まとめました", "把大家关心的问题<br>整理在这里");
  K("faq.q1", "배치는 정말 무료인가요?", "Is the layout tool really free?", "配置は本当に無料ですか？", "布局真的免费吗？");
  K("faq.a1", "네. 가구 배치는 횟수 제한 없이 무료로 쓸 수 있어요.",
    "Yes. You can use the furniture layout tool for free, with no limit on how often.",
    "はい。家具の配置は回数制限なしで無料でお使いいただけます。",
    "是的。家具布局不限次数，可免费使用。");
  K("faq.q2", "AI 렌더는 얼마인가요?", "How much is an AI render?", "AIレンダーはいくらですか？", "AI 渲染多少钱？");
  K("faq.a2", "AI 렌더 페이지에서 확인할 수 있어요.", "You can check it on the AI Render page.", "AIレンダーのページで確認できます。", "可在 AI 渲染页面查看。");
  K("faq.a2free", "처음 {n}회는 무료이고, 그다음부터 유료예요. 가격은 AI 렌더 페이지에서 확인할 수 있어요.",
    "The first {n} are free, then it's paid. You can see the price on the AI Render page.",
    "最初の{n}回は無料で、それ以降は有料です。価格はAIレンダーのページで確認できます。",
    "前 {n} 次免费，之后收费。价格可在 AI 渲染页面查看。");
  K("faq.q3", "가구 치수는 정확한가요?", "Are the furniture sizes accurate?", "家具の寸法は正確ですか？", "家具尺寸准确吗？");
  K("faq.a3", "기본 가구 치수는 흔한 예시 값이에요. 사려는 제품의 실제 치수로 고쳐서 확인해 주세요.",
    "The default sizes are common example values. Please change them to the actual dimensions of the product you plan to buy.",
    "基本の家具寸法は一般的な例の値です。購入予定の製品の実際の寸法に直して確認してください。",
    "默认家具尺寸只是常见的示例值。请改成您要买的产品的实际尺寸再确认。");
  K("faq.q4", "회원가입이 필요한가요?", "Do I need to sign up?", "会員登録は必要ですか？", "需要注册吗？");
  K("faq.a4", "배치는 가입 없이 바로 쓸 수 있어요. 작업 내용은 지금 쓰는 기기의 브라우저에 저장돼요.",
    "No sign-up is needed for layouts. Your work is saved in the browser on the device you're using.",
    "配置は登録なしですぐ使えます。作業内容は今お使いの端末のブラウザに保存されます。",
    "布局无需注册即可使用。作业内容会保存在当前设备的浏览器中。");

  /* ===================== AI 렌더 안내 (렌더신청.html) ===================== */
  K("title.render", "방 만들기 · AI 렌더", "Room Maker · AI Render", "部屋づくり · AIレンダー", "布置房间 · AI 渲染");
  K("r.h1",
    "배치한 방,<br>완성되면 어떤 분위기일까?",
    "Your laid-out room —<br>what will it feel like when finished?",
    "配置した部屋、<br>完成したらどんな雰囲気？",
    "布置好的房间，<br>完成后会是什么氛围？");
  K("r.p",
    "지금 배치한 도면으로 AI가 분위기 이미지를 바로 만들어 줘요. 신청하고 기다릴 필요 없이, 배치 화면에서 버튼 하나면 돼요.",
    "AI instantly creates a mood image from the layout you just made. No applying and waiting — just one button on the layout screen.",
    "今配置した図面から、AIがすぐに雰囲気の画像を作ります。申し込んで待つ必要はなく、配置画面のボタンひとつです。",
    "AI 会根据您刚布置好的平面图立即生成氛围图。无需申请等待，在布局页面点一下按钮即可。");
  K("r.free.label", "무료 렌더", "Free renders", "無料レンダー", "免费渲染");
  K("r.times", "{n}회", "{n}", "{n}回", "{n} 次");
  K("r.none", "없음", "None", "なし", "无");
  K("r.free.sub", "처음 이용할 때 (이 브라우저 기준)", "On first use (counted per this browser)", "初めてご利用の際（このブラウザ単位）", "首次使用时（以此浏览器为准）");
  K("r.paid.label", "유료 렌더 1장", "Paid render (1 image)", "有料レンダー1枚", "付费渲染（1 张）");
  K("r.paid.tbd", "가격 미정", "Price TBD", "価格未定", "价格待定");
  K("price.won", "{p}원", "₩{p}", "{p}ウォン", "{p} 韩元");
  K("price.free", "무료", "Free", "無料", "免费");
  K("r.paid.sub",
    "유료 이용은 준비 중이에요. 이 가격이면 쓰실지 알려 주세요",
    "Paid use is being prepared. Let us know if you'd use it at this price.",
    "有料での利用は準備中です。この価格なら使うかどうか教えてください。",
    "付费使用正在准备中。请告诉我们这个价格您是否愿意使用。");
  K("r.notice",
    "렌더 이미지는 <b>AI가 그린 참고용 시안</b>이에요. 가구 위치·크기·색이 도면과 조금 다를 수 있고, 실제 제품의 색·질감과도 달라요.",
    "Render images are <b>AI-drawn reference drafts</b>. Furniture position, size and color may differ slightly from your plan, and from the real products' colors and textures.",
    "レンダー画像は<b>AIが描いた参考用の下絵</b>です。家具の位置・大きさ・色が図面と少し違うことがあり、実際の製品の色や質感とも異なります。",
    "渲染图是 <b>AI 绘制的参考草图</b>。家具的位置、大小、颜色可能与平面图略有出入，也和真实产品的颜色、质感不同。");
  K("r.how", "이렇게 만들어요", "How it works", "作り方", "制作流程");
  K("r.s1.b", "방 크기와 가구 배치", "Room size and furniture layout", "部屋の広さと家具の配置", "房间尺寸与家具布局");
  K("r.s1.d",
    "배치 화면에서 방을 그리고 가구를 놓아요. 「자동 배치」도 쓸 수 있어요.",
    "Draw the room and place furniture on the layout screen. You can also use “Auto layout.”",
    "配置画面で部屋を作り、家具を置きます。「自動配置」も使えます。",
    "在布局页面画出房间并摆放家具。也可以使用「自动布置」。");
  K("r.s2.b", "「✦ AI 렌더 만들기」 누르기", "Press “✦ Make AI render”", "「✦ AIレンダーを作る」を押す", "点击「✦ 生成 AI 渲染」");
  K("r.s2.d",
    "분위기를 고르고, 원하면 방 사진을 올려요. 방 사진을 올리면 그 방의 벽·바닥·창문 느낌이 반영돼요.",
    "Pick a mood and, if you like, upload a room photo. With a photo, the walls, floor and windows of that room are reflected.",
    "雰囲気を選び、必要なら部屋の写真をアップロードします。写真を上げると、その部屋の壁・床・窓の雰囲気が反映されます。",
    "选择氛围，也可以上传房间照片。上传照片后，会反映出那个房间的墙面、地面和窗户的感觉。");
  K("r.s3.b", "이미지 확인하고 저장", "Check and save the image", "画像を確認して保存", "查看并保存图片");
  K("r.s3.d",
    "보통 30초~2분 걸려요. 마음에 안 들면 분위기를 바꿔 다시 만들 수 있어요. (다시 만들면 무료 횟수가 1회 줄어요.)",
    "It usually takes 30 seconds to 2 minutes. If you don't like it, change the mood and make it again. (Making it again uses up 1 free render.)",
    "通常30秒〜2分かかります。気に入らなければ、雰囲気を変えて作り直せます。（作り直すと無料回数が1回減ります。）",
    "通常需要 30 秒到 2 分钟。不满意的话，可以换个氛围重新生成。（重新生成会减少 1 次免费次数。）");
  K("r.s4.b", "무료 횟수를 다 쓰면", "When free renders run out", "無料回数を使い切ったら", "免费次数用完后");
  K("r.s4.d",
    "유료 이용은 준비 중이에요. 쓰고 싶으시면 아래에서 알려 주세요.",
    "Paid use is being prepared. If you'd like to use it, let us know below.",
    "有料での利用は準備中です。使いたい方は下からお知らせください。",
    "付费使用正在准备中。如果您想使用，请在下方告诉我们。");
  K("r.go", "배치하러 가서 렌더 만들기 →", "Go to the layout and make a render →", "配置画面へ行ってレンダーを作る →", "去布局页面生成渲染 →");
  K("r.alert", "유료 이용 알림 받기", "Get notified about paid use", "有料開始の通知を受け取る", "接收付费使用通知");
  K("r.form.off",
    "유료 이용 알림 신청서가 아직 연결되지 않았어요. (운영자 안내: 설정.js 의 formUrl 에 구글 폼 주소를 넣어 주세요.)",
    "The paid-use notification form isn't connected yet. (Note for the operator: put the Google Form URL into formUrl in 설정.js.)",
    "有料開始の通知申込フォームがまだ接続されていません。（運営者向け：設定.js の formUrl に Google フォームのURLを入れてください。）",
    "付费使用通知的申请表尚未连接。（运营者提示：请把 Google 表单地址填入 설정.js 的 formUrl。）");
  K("r.priv.h", "사진과 개인정보 안내", "Photos and privacy", "写真と個人情報について", "照片与隐私说明");
  K("r.priv.1",
    "도면과 방 사진은 렌더를 만드는 동안에만 쓰고, 이 서버에는 저장하지 않아요.",
    "Your plan and room photo are used only while the render is being made, and are not stored on this server.",
    "図面と部屋の写真はレンダーを作る間だけ使い、このサーバーには保存しません。",
    "平面图和房间照片仅在生成渲染期间使用，不会保存在本服务器上。");
  K("r.priv.2",
    "이미지를 만들기 위해 도면과 방 사진은 서버를 거쳐 OpenAI(AI 회사)로 보내져요.",
    "To create the image, your plan and room photo are sent through our server to OpenAI (an AI company).",
    "画像を作るため、図面と部屋の写真はサーバー経由でOpenAI（AI企業）に送られます。",
    "为了生成图片，平面图和房间照片会经由服务器发送给 OpenAI（AI 公司）。");
  K("r.priv.3",
    "방 사진에 주소, 이름, 택배 송장처럼 개인정보가 보이면 가린 뒤 올려 주세요.",
    "If your room photo shows personal information such as an address, name or delivery label, cover it before uploading.",
    "部屋の写真に住所・名前・宅配の伝票などの個人情報が写っている場合は、隠してからアップロードしてください。",
    "如果房间照片里能看到地址、姓名、快递单等个人信息，请先遮挡后再上传。");
  K("r.priv.4", "무료 횟수는 이 브라우저를 기준으로 세요.", "Free renders are counted per this browser.", "無料回数はこのブラウザ単位で数えます。", "免费次数以此浏览器为准计算。");

  /* ===================== 배치 도구 (배치.html) ===================== */
  K("title.layout", "방 만들기 · 배치", "Room Maker · Layout", "部屋づくり · 配置", "布置房间 · 布局");
  K("l.w", "가로 (cm)", "Width (cm)", "横 (cm)", "宽 (cm)");
  K("l.h", "세로 (cm)", "Length (cm)", "縦 (cm)", "长 (cm)");
  K("l.s1", "1. 방 크기", "1. Room size", "1. 部屋の広さ", "1. 房间尺寸");
  K("l.area",
    "면적 <b>{m2}㎡</b> (약 {py}평) · 가구가 차지하는 비율 <b>{ratio}%</b>",
    "Area <b>{m2}㎡</b> (about {py} pyeong) · Furniture covers <b>{ratio}%</b>",
    "面積 <b>{m2}㎡</b>（約{py}坪）· 家具が占める割合 <b>{ratio}%</b>",
    "面积 <b>{m2}㎡</b>（约 {py} 坪）· 家具占比 <b>{ratio}%</b>");
  K("l.check", "확인이 필요한 가구 {n}개", "Furniture to check: {n}", "確認が必要な家具：{n}個", "需要确认的家具：{n} 件");
  K("l.s2", "2. 가구 추가", "2. Add furniture", "2. 家具を追加", "2. 添加家具");
  K("l.import", "📎 사진·링크로 가구 불러오기", "📎 Import from photos or links", "📎 写真・リンクから読み込む", "📎 从照片或链接导入");
  K("l.addhint", "누르면 방 가운데에 놓여요. (치수는 예시 값)", "Click to drop it in the middle of the room. (Sizes are examples)", "押すと部屋の真ん中に置かれます。（寸法は例の値）", "点击后会放在房间中央。（尺寸为示例值）");
  K("l.manual", "직접 입력하기", "Enter manually", "自分で入力する", "手动输入");
  K("l.name", "이름", "Name", "名前", "名称");
  K("l.nameph", "예: 서랍장", "e.g. Dresser", "例：チェスト", "例如：抽屉柜");
  K("l.add", "추가", "Add", "追加", "添加");
  K("l.addaria", "{name} 추가, {size}", "Add {name}, {size}", "{name}を追加、{size}", "添加{name}，{size}");
  K("l.openw", "폭 {w}cm", "Width {w}cm", "幅 {w}cm", "宽 {w}cm");

  /* 가구 묶음 이름 · 가구 이름 (설정.js 의 한국어 이름과 짝이 되어야 해요) */
  K("g.침대", "침대", "Beds", "ベッド", "床");
  K("g.책상·의자", "책상·의자", "Desks & chairs", "机・椅子", "书桌·椅子");
  K("g.수납", "수납", "Storage", "収納", "收纳");
  K("g.거실·주방", "거실·주방", "Living & kitchen", "リビング・キッチン", "客厅·厨房");
  K("g.문·창문", "문·창문", "Doors & windows", "ドア・窓", "门·窗");
  K("g.기타", "기타", "Other", "その他", "其他");
  K("n.싱글 침대", "싱글 침대", "Single bed", "シングルベッド", "单人床");
  K("n.슈퍼싱글 침대", "슈퍼싱글 침대", "Super single bed", "スーパーシングルベッド", "加大单人床");
  K("n.퀸 침대", "퀸 침대", "Queen bed", "クイーンベッド", "Queen 大床");
  K("n.책상", "책상", "Desk", "机", "书桌");
  K("n.의자", "의자", "Chair", "椅子", "椅子");
  K("n.옷장", "옷장", "Wardrobe", "ワードローブ", "衣柜");
  K("n.2인 소파", "2인 소파", "2-seat sofa", "2人掛けソファ", "双人沙发");
  K("n.냉장고", "냉장고", "Fridge", "冷蔵庫", "冰箱");
  K("n.문", "문", "Door", "ドア", "门");
  K("n.창문", "창문", "Window", "窓", "窗户");
  K("n.가구", "가구", "Furniture", "家具", "家具");

  /* 도면 아래쪽 */
  K("a.auto", "✦ 자동 배치", "✦ Auto layout", "✦ 自動配置", "✦ 自动布置");
  K("a.alt", "다른 배치 보기", "See another layout", "別の配置を見る", "查看其他布局");
  K("a.undo", "↺ 자동 배치 전으로", "↺ Back to before auto layout", "↺ 自動配置の前に戻す", "↺ 恢复到自动布置前");
  K("a.hint",
    "가구를 넣고 누르면 벽에 붙이고, 문 앞과 통로는 비워서 알아서 놓아 줘요. 가구가 하나도 없으면 방 종류에 맞는 필수 가구를 먼저 넣어 줘요.",
    "Add furniture and press this: pieces go against the walls, and the area by the door and walkways are kept clear. If the room is empty, the essential furniture for the room type is added first.",
    "家具を入れて押すと、壁に付けてドア前や通路を空けながら自動で置きます。家具が1つもない場合は、部屋の種類に合った必需品の家具を先に入れます。",
    "添加家具后点击，家具会靠墙摆放，并留出门前和通道的空间。如果房间里一件家具都没有，会先加入该房间类型的必备家具。");
  K("a.none", "먼저 왼쪽에서 가구를 추가해 주세요.", "Please add some furniture on the left first.", "まず左側で家具を追加してください。", "请先在左侧添加家具。");
  K("a.done", "가구 {n}개를 자동으로 배치했어요.", "Placed {n} pieces of furniture automatically.", "家具{n}個を自動で配置しました。", "已自动布置 {n} 件家具。");
  K("a.failed", " 자리가 부족한 가구: {list} (방 밖에 두었어요)", " Not enough room for: {list} (left outside the room)", " 場所が足りない家具：{list}（部屋の外に置きました）", " 空间不足的家具：{list}（已放在房间外）");
  K("a.tight", " 문 앞 통로가 좁을 수 있어요.", " The walkway in front of the door may be tight.", " ドア前の通路が狭いかもしれません。", " 门前的通道可能比较窄。");
  K("a.undone", "자동 배치 전으로 되돌렸어요.", "Restored the layout from before auto layout.", "自動配置の前に戻しました。", "已恢复到自动布置前。");
  K("a.added", "가구 {n}개를 방에 넣었어요. 「자동 배치」를 눌러 보세요.", "Added {n} pieces to the room. Try “Auto layout.”", "家具{n}個を部屋に入れました。「自動配置」を押してみてください。", "已把 {n} 件家具放入房间。试试「自动布置」吧。");
  K("a.lg1", "빨간 테두리: 다른 가구와 겹침", "Red outline: overlaps another piece", "赤い枠：他の家具と重なっている", "红框：与其他家具重叠");
  K("a.lg2", "주황 점선: 방 밖으로 나감", "Orange dashes: outside the room", "オレンジの点線：部屋の外に出ている", "橙色虚线：超出房间");
  K("a.lg3", "문이 열리는 자리와 지나다닐 통로는 직접 확인해 주세요.", "Please check the door swing area and walkways yourself.", "ドアが開く場所と通り道はご自身で確認してください。", "开门的空间和通行的过道请自行确认。");
  K("a.svg", "방 배치도", "Room layout plan", "部屋の配置図", "房间布局图");
  K("a.drag",
    "가구를 끌어서 옮기세요(5cm 단위). 누르면 선택돼요. 컴퓨터에서는 방향키로 5cm씩, Delete 키로 삭제할 수 있어요.",
    "Drag furniture to move it (in 5 cm steps). Click to select. On a computer, use the arrow keys to move 5 cm at a time and Delete to remove.",
    "家具をドラッグして動かします（5cm単位）。クリックで選択されます。パソコンでは矢印キーで5cmずつ移動、Deleteキーで削除できます。",
    "拖动家具即可移动（以 5cm 为单位）。点击即可选中。在电脑上可用方向键每次移动 5cm，按 Delete 键删除。");

  K("l.roomType", "방 종류", "Room type", "部屋の種類", "房间类型");
  K("rt.bedroom", "침실", "Bedroom", "寝室", "卧室");
  K("rt.living", "거실", "Living room", "リビング", "客厅");
  K("rt.studio", "원룸", "Studio", "ワンルーム", "单间");
  K("rt.study", "서재", "Study", "書斎", "书房");
  K("rt.kitchen", "주방", "Kitchen", "キッチン", "厨房");
  K("a.filled", "「{room}」에 필요한 가구 {n}개를 추가했어요: {list}.", "Added {n} essential piece(s) for “{room}”: {list}.", "「{room}」に必要な家具を{n}個追加しました：{list}。", "已为「{room}」添加 {n} 件必备家具：{list}。");
  K("a.fillHint", " 빼고 싶은 가구는 아래 「놓인 가구」의 ✕로 지울 수 있어요.", " To remove a piece, press its ✕ in “Furniture in the room” below.", " 外したい家具は、下の「置いてある家具」の ✕ で削除できます。", " 想去掉的家具，可在下方「房间里的家具」中点击 ✕ 删除。");
  K("p.list", "놓인 가구 ({n})", "Furniture in the room ({n})", "置いてある家具（{n}）", "房间里的家具（{n}）");
  K("p.listEmpty", "아직 놓은 가구가 없어요.", "No furniture placed yet.", "まだ家具がありません。", "还没有摆放家具。");
  K("p.remove", "{name} 지우기", "Remove {name}", "{name}を削除", "删除{name}");
  K("n.협탁", "협탁", "Nightstand", "ナイトテーブル", "床头柜");
  K("n.서랍장", "서랍장", "Dresser", "チェスト", "抽屉柜");
  K("n.책장", "책장", "Bookcase", "本棚", "书架");
  K("n.TV장", "TV장", "TV stand", "テレビ台", "电视柜");
  K("n.3인 소파", "3인 소파", "3-seat sofa", "3人掛けソファ", "三人沙发");
  K("n.거실 테이블", "거실 테이블", "Coffee table", "センターテーブル", "茶几");
  K("n.식탁", "식탁", "Dining table", "ダイニングテーブル", "餐桌");
  K("nav.house", "집 전체", "Whole home", "家全体", "整套房子");

  K("g.주방", "주방", "Kitchen", "キッチン", "厨房");
  K("n.싱크대 120", "싱크대 120", "Sink unit 120", "シンク台 120", "水槽柜 120");
  K("n.싱크대 180", "싱크대 180", "Sink unit 180", "シンク台 180", "水槽柜 180");
  K("n.조리대", "조리대", "Cooktop counter", "調理台", "灶台柜");
  K("n.주방 수납장", "주방 수납장", "Kitchen cabinet", "キッチン収納", "厨房收纳柜");
  K("n.소형 냉장고", "소형 냉장고", "Mini fridge", "ミニ冷蔵庫", "小冰箱");
  K("n.세탁기", "세탁기", "Washer", "洗濯機", "洗衣机");
  K("l.swing", "열림 {w}cm", "Swing {w} cm", "開き {w}cm", "开启 {w}cm");
  K("l.swingFlip", "↔ 안쪽/바깥쪽 열림 바꾸기", "↔ Swing in / out", "↔ 内開き/外開きを切り替え", "↔ 切换内开/外开");
  K("l.hingeFlip", "⇋ 경첩 쪽 바꾸기", "⇋ Flip hinge side", "⇋ 蝶番の側を切り替え", "⇋ 切换合页侧");
  K("p.sel", "선택한 가구", "Selected furniture", "選択中の家具", "所选家具");
  K("p.rot", "↻ 90° 회전", "↻ Rotate 90°", "↻ 90°回転", "↻ 旋转 90°");
  K("p.del", "삭제", "Delete", "削除", "删除");
  K("p.s3", "3. 저장하고 AI 렌더", "3. Save and AI render", "3. 保存してAIレンダー", "3. 保存并 AI 渲染");
  K("p.render", "✦ AI 렌더 만들기", "✦ Make AI render", "✦ AIレンダーを作る", "✦ 生成 AI 渲染");
  K("p.png", "배치 그림 저장 (PNG)", "Save layout image (PNG)", "配置図を保存（PNG）", "保存布局图（PNG）");
  K("p.clear", "가구 모두 지우기", "Clear all furniture", "家具をすべて消す", "清除所有家具");
  K("p.saved", "작업 내용은 이 기기의 브라우저에 자동 저장돼요.", "Your work is saved automatically in this device's browser.", "作業内容はこの端末のブラウザに自動保存されます。", "作业内容会自动保存在此设备的浏览器中。");
  K("p.confirmClear", "가구를 모두 지울까요? 되돌릴 수 없어요.", "Clear all furniture? This can't be undone.", "家具をすべて消しますか？元に戻せません。", "要清除所有家具吗？此操作无法撤销。");
  K("p.pngBlocked", "이 브라우저에서는 그림 저장이 막혀 있어요. 크롬에서 다시 시도하거나 화면을 캡처해 주세요.",
    "Saving images is blocked in this browser. Try again in Chrome, or take a screenshot.",
    "このブラウザでは画像の保存がブロックされています。Chromeでもう一度試すか、画面をキャプチャしてください。",
    "此浏览器禁止保存图片。请在 Chrome 中重试，或直接截图。");
  K("p.pngFail", "그림을 만들지 못했어요. 크롬에서 다시 시도해 주세요.", "Couldn't create the image. Please try again in Chrome.", "画像を作れませんでした。Chromeでもう一度お試しください。", "无法生成图片。请在 Chrome 中重试。");
  K("p.export", "방 만들기 배치도 · {w} × {h} cm", "Room Maker layout · {w} × {h} cm", "部屋づくり 配置図 · {w} × {h} cm", "布置房间 布局图 · {w} × {h} cm");
  K("p.fileplan", "방만들기_배치도_{w}x{h}.png", "RoomMaker_layout_{w}x{h}.png", "部屋づくり_配置図_{w}x{h}.png", "布置房间_布局图_{w}x{h}.png");
  K("p.filerender", "방만들기_AI렌더.jpg", "RoomMaker_AI_render.jpg", "部屋づくり_AIレンダー.jpg", "布置房间_AI渲染.jpg");

  /* ---- 가구 불러오기 창 ---- */
  K("i.title", "사진·링크로 가구 불러오기", "Import furniture from photos or links", "写真・リンクから家具を読み込む", "从照片或链接导入家具");
  K("i.close", "✕ 닫기", "✕ Close", "✕ 閉じる", "✕ 关闭");
  K("i.closeAria", "닫기", "Close", "閉じる", "关闭");
  K("i.notice",
    "사진을 올리고 <b>「✦ AI로 읽기」</b>를 누르면 AI가 사진에 적힌 치수를 읽어서 아래 표를 채워 줘요. <b>AI가 틀릴 수 있으니 사진과 비교해서 꼭 확인해 주세요.</b> 「AI로 읽기」를 누른 사진만 서버를 거쳐 OpenAI(AI 회사)로 보내지고, 이 서버에는 저장하지 않아요. 링크는 아직 AI가 읽지 못해서 직접 적어 주세요.",
    "Upload a photo and press <b>“✦ Read with AI”</b> — the AI reads the dimensions written on the photo and fills in the table below. <b>The AI can be wrong, so always compare with the photo.</b> Only photos you press “Read with AI” on are sent through our server to OpenAI (an AI company), and nothing is stored on this server. The AI can't read links yet, so please type those in yourself.",
    "写真をアップロードして<b>「✦ AIで読み取る」</b>を押すと、AIが写真に書かれた寸法を読み取って下の表を埋めます。<b>AIは間違えることがあるので、必ず写真と見比べて確認してください。</b>「AIで読み取る」を押した写真だけがサーバー経由でOpenAI（AI企業）に送られ、このサーバーには保存されません。リンクはまだAIが読めないので、手入力してください。",
    "上传照片并点击<b>「✦ 用 AI 读取」</b>，AI 会读取照片上标注的尺寸并填入下方表格。<b>AI 可能会出错，请务必与照片对照确认。</b>只有点击「用 AI 读取」的照片才会经由服务器发送给 OpenAI（AI 公司），且不会保存在本服务器上。目前 AI 还无法读取链接，请手动填写。");
  K("i.upload", "📷 사진 올리기", "📷 Upload photos", "📷 写真をアップロード", "📷 上传照片");
  K("i.drophint", "또는 사진을 여기로 끌어다 놓거나, 복사한 사진을 붙여넣기(Ctrl+V)", "Or drag photos here, or paste a copied photo (Ctrl+V)", "または写真をここにドラッグするか、コピーした写真を貼り付け（Ctrl+V）", "也可以把照片拖到这里，或粘贴已复制的照片（Ctrl+V）");
  K("i.urlph", "쇼핑몰 상품 주소 붙여넣기 (https://…)", "Paste a shop product URL (https://…)", "ショップの商品URLを貼り付け（https://…）", "粘贴商城商品链接（https://…）");
  K("i.urlAria", "상품 주소", "Product URL", "商品URL", "商品链接");
  K("i.urlAdd", "링크 추가", "Add link", "リンクを追加", "添加链接");
  K("i.aiAll", "✦ 사진 모두 AI로 읽기", "✦ Read all photos with AI", "✦ 写真をすべてAIで読み取る", "✦ 用 AI 读取全部照片");
  K("i.aiHint", "사진마다 AI가 가구 이름·종류·치수를 읽어서 표를 채워요.", "For each photo, the AI reads the furniture name, type and size and fills in the table.", "写真ごとにAIが家具の名前・種類・寸法を読み取って表を埋めます。", "AI 会逐张读取照片中的家具名称、类型和尺寸并填入表格。");
  K("i.code", "이용 코드", "Access code", "利用コード", "使用码");
  K("i.codeph", "시범 참여자에게 알려 드린 코드", "The code given to pilot participants", "試験参加者にお伝えしたコード", "已告知试用参与者的代码");
  K("i.addRoom", "방에 넣기", "Add to room", "部屋に入れる", "放入房间");
  K("i.addAuto", "방에 넣고 자동 배치", "Add to room and auto-layout", "部屋に入れて自動配置", "放入房间并自动布置");
  K("i.empty", "사진을 올리거나 링크를 추가하면, 여기에 가구 한 줄씩 나와요.", "Upload a photo or add a link, and each piece of furniture will appear here as one row.", "写真をアップロードするかリンクを追加すると、ここに家具が1行ずつ表示されます。", "上传照片或添加链接后，每件家具会在这里显示为一行。");
  K("i.kind.auto", "종류: 이름 보고 자동", "Type: auto from name", "種類：名前から自動", "类型：按名称自动");
  K("i.kind.bed", "침대", "Bed", "ベッド", "床");
  K("i.kind.desk", "책상", "Desk", "机", "书桌");
  K("i.kind.chair", "의자", "Chair", "椅子", "椅子");
  K("i.kind.storage", "수납 (옷장·서랍·책장)", "Storage (wardrobe, drawers, shelves)", "収納（ワードローブ・引き出し・本棚）", "收纳（衣柜·抽屉·书架）");
  K("i.kind.sofa", "소파", "Sofa", "ソファ", "沙发");
  K("i.kind.fridge", "냉장고·세탁기", "Fridge / washer", "冷蔵庫・洗濯機", "冰箱·洗衣机");
  K("i.kind.misc", "기타", "Other", "その他", "其他");
  K("i.kindAria", "가구 종류", "Furniture type", "家具の種類", "家具类型");
  K("i.type", "종류", "Type", "種類", "类型");
  K("i.nameph2", "예: 침대", "e.g. Bed", "例：ベッド", "例如：床");
  K("i.big", "크게 보기", "View larger", "拡大して見る", "查看大图");
  K("i.openLink", "🔗 상품 페이지 열기 ↗", "🔗 Open product page ↗", "🔗 商品ページを開く ↗", "🔗 打开商品页面 ↗");
  K("i.pasted", "붙여넣은 사진", "Pasted photo", "貼り付けた写真", "粘贴的照片");
  K("i.aiRead", "✦ AI로 읽기", "✦ Read with AI", "✦ AIで読み取る", "✦ 用 AI 读取");
  K("i.aiAgain", "↻ 다시 읽기", "↻ Read again", "↻ もう一度読み取る", "↻ 重新读取");
  K("i.aiBusyBtn", "읽는 중…", "Reading…", "読み取り中…", "读取中…");
  K("i.aiBusy", "✦ AI가 사진을 읽는 중이에요… (10~30초 걸릴 수 있어요)", "✦ The AI is reading the photo… (this can take 10–30 seconds)", "✦ AIが写真を読み取っています…（10〜30秒かかることがあります）", "✦ AI 正在读取照片…（可能需要 10~30 秒）");
  K("i.aiHead", "✦ AI가 읽음 · {conf}", "✦ Read by AI · {conf}", "✦ AIが読み取りました · {conf}", "✦ AI 已读取 · {conf}");
  K("i.aiHeight", " · 높이 {h}cm", " · height {h}cm", " · 高さ {h}cm", " · 高度 {h}cm");
  K("i.aiMissing", " · 못 읽은 칸은 직접 적어 주세요", " · please fill in any blanks yourself", " · 読み取れなかった欄は手入力してください", " · 未能读取的栏请手动填写");
  K("i.aiCompare", " · 사진과 비교해서 확인해 주세요", " · compare with the photo to check", " · 写真と見比べて確認してください", " · 请与照片对照确认");
  K("i.evidence", "근거: {text}", "Basis: {text}", "根拠：{text}", "依据：{text}");
  K("i.conf.high", "확실", "Certain", "確実", "确定");
  K("i.conf.medium", "애매함 · 확인 필요", "Unclear · please check", "あいまい · 要確認", "不太确定 · 需确认");
  K("i.conf.low", "불확실 · 꼭 확인", "Uncertain · must check", "不確実 · 必ず確認", "不确定 · 务必确认");
  K("i.skipNotImg", "{name} (사진 파일이 아니에요)", "{name} (not an image file)", "{name}（写真ファイルではありません）", "{name}（不是图片文件）");
  K("i.skipBig", "{name} ({mb}MB가 넘어요)", "{name} (over {mb}MB)", "{name}（{mb}MBを超えています）", "{name}（超过 {mb}MB）");
  K("i.skipMax", "{name} (한 번에 {n}개까지예요)", "{name} (up to {n} at a time)", "{name}（一度に{n}個までです）", "{name}（一次最多 {n} 个）");
  K("i.skipped", "넣지 못한 파일: {list}", "Files that couldn't be added: {list}", "追加できなかったファイル：{list}", "未能添加的文件：{list}");
  K("i.photosAdded", "사진 {n}장을 추가했어요. 사진을 보면서 이름과 치수를 적어 주세요.", "Added {n} photo(s). Look at each photo and type in the name and size.", "写真を{n}枚追加しました。写真を見ながら名前と寸法を入力してください。", "已添加 {n} 张照片。请对照照片填写名称和尺寸。");
  K("i.badUrl", "주소 모양이 아니에요. 상품 주소를 그대로 붙여 넣어 주세요.", "That doesn't look like a URL. Please paste the product address as it is.", "URLの形式ではありません。商品のURLをそのまま貼り付けてください。", "这不像是网址。请原样粘贴商品链接。");
  K("i.badProto", "http:// 또는 https:// 로 시작하는 주소만 넣을 수 있어요.", "Only addresses starting with http:// or https:// can be added.", "http:// または https:// で始まるURLのみ追加できます。", "只能添加以 http:// 或 https:// 开头的网址。");
  K("i.maxRows", "한 번에 {n}개까지 넣을 수 있어요.", "You can add up to {n} at a time.", "一度に{n}個まで追加できます。", "一次最多可添加 {n} 个。");
  K("i.linkAdded", "링크를 추가했어요. 「상품 페이지 열기」로 치수를 확인해서 적어 주세요.", "Link added. Use “Open product page” to check the size and type it in.", "リンクを追加しました。「商品ページを開く」で寸法を確認して入力してください。", "已添加链接。请通过「打开商品页面」确认尺寸后填写。");
  K("i.badSize", "가로·세로(cm)를 적지 않은 가구가 {n}개 있어요. 빨간 테두리 줄을 채워 주세요. (5 이상)", "{n} item(s) are missing width or length (cm). Please fill in the rows with a red outline. (5 or more)", "横・縦（cm）が未入力の家具が{n}個あります。赤い枠の行を埋めてください。（5以上）", "有 {n} 件家具没有填写长宽（cm）。请填写红框的行。（5 以上）");
  K("i.codeNeed", "이용 코드가 필요해요. 위 칸에 코드를 넣은 뒤 다시 눌러 주세요.", "An access code is needed. Enter it in the box above and press again.", "利用コードが必要です。上の欄にコードを入れてからもう一度押してください。", "需要使用码。请在上方输入后再点击。");
  K("i.noItems", "사진에서 가구 치수를 찾지 못했어요.", "Couldn't find furniture dimensions in the photo.", "写真から家具の寸法を見つけられませんでした。", "未能在照片中找到家具尺寸。");
  K("i.noItems2", " 치수가 적힌 부분이 보이는 사진으로 해 보거나 직접 적어 주세요.", " Try a photo where the written dimensions are visible, or type them in yourself.", " 寸法が書かれた部分が見える写真で試すか、手入力してください。", " 请换一张能看到尺寸标注的照片，或手动填写。");
  K("i.readNone", "AI로 읽을 사진이 없어요. (이미 읽은 사진은 줄마다 「다시 읽기」를 누르세요.)", "There are no photos to read with AI. (For photos already read, press “Read again” on that row.)", "AIで読み取る写真がありません。（読み取り済みの写真は、行ごとに「もう一度読み取る」を押してください。）", "没有需要用 AI 读取的照片。（已读取的照片请在对应行点击「重新读取」。）");
  K("i.readingN", "사진 {n}장을 AI가 읽는 중이에요…", "The AI is reading {n} photo(s)…", "AIが写真{n}枚を読み取っています…", "AI 正在读取 {n} 张照片…");
  K("i.readDone", "AI 읽기 끝: {ok}장 성공. 사진과 비교해서 치수를 확인한 뒤 방에 넣어 주세요.", "AI reading finished: {ok} succeeded. Compare with the photos to check the sizes, then add them to the room.", "AIの読み取りが完了：{ok}枚成功。写真と見比べて寸法を確認してから部屋に入れてください。", "AI 读取完成：成功 {ok} 张。请与照片对照确认尺寸后再放入房间。");
  K("i.readDoneBad", "AI 읽기 끝: {ok}장 성공, {bad}장은 안내를 확인해 주세요. 사진과 비교해서 치수를 확인한 뒤 방에 넣어 주세요.", "AI reading finished: {ok} succeeded, {bad} need your attention (see the notes). Compare with the photos to check the sizes, then add them to the room.", "AIの読み取りが完了：{ok}枚成功、{bad}枚は案内を確認してください。写真と見比べて寸法を確認してから部屋に入れてください。", "AI 读取完成：成功 {ok} 张，{bad} 张请查看提示。请与照片对照确认尺寸后再放入房间。");
  K("i.err.off", "AI 읽기를 지금은 쓸 수 없어요. 직접 적어 주세요.", "AI reading isn't available right now. Please type the sizes in yourself.", "AIの読み取りは今は使えません。手入力してください。", "AI 读取目前无法使用。请手动填写。");
  K("i.err.404", "이 화면에서는 AI 읽기를 쓸 수 없어요. (배포된 사이트나 「사이트_열기.bat」으로 연 화면에서 써 주세요.)", "AI reading isn't available on this screen. (Use it on the deployed site or a page opened with 「사이트_열기.bat」.)", "この画面ではAIの読み取りは使えません。（公開サイトか「사이트_열기.bat」で開いた画面で使ってください。）", "此页面无法使用 AI 读取。（请在已发布的网站或用「사이트_열기.bat」打开的页面中使用。）");
  K("i.err.413", "사진이 너무 커요. 더 작은 사진으로 해 주세요.", "The photo is too large. Please use a smaller one.", "写真が大きすぎます。もっと小さい写真にしてください。", "照片太大了。请换一张更小的照片。");
  K("i.err.fail", "AI 읽기에 실패했어요. 잠시 뒤에 다시 해 보세요.", "AI reading failed. Please try again in a moment.", "AIの読み取りに失敗しました。しばらくしてからもう一度お試しください。", "AI 读取失败。请稍后再试。");
  K("i.err.badImg", "이 사진은 열 수 없어요. JPG·PNG 사진으로 해 주세요.", "This photo can't be opened. Please use a JPG or PNG photo.", "この写真は開けません。JPGまたはPNGの写真にしてください。", "无法打开这张照片。请使用 JPG 或 PNG 照片。");
  K("i.err.conn", "연결에 실패했어요. 인터넷을 확인하고 다시 눌러 주세요.", "Connection failed. Check your internet and press again.", "接続に失敗しました。インターネットを確認してもう一度押してください。", "连接失败。请检查网络后再点击。");

  /* 서버가 알려 주는 오류 종류 → 화면에 보일 글 (한국어 외 언어일 때 사용) */
  K("e.bad_request", "요청 모양이 맞지 않아요.", "The request wasn't in the right format.", "リクエストの形式が正しくありません。", "请求格式不正确。");
  K("e.bad_images", "사진 형식(JPG·PNG·WEBP·GIF)이나 크기가 맞지 않아요.", "The photo format (JPG, PNG, WEBP, GIF) or size isn't accepted.", "写真の形式（JPG・PNG・WEBP・GIF）またはサイズが合っていません。", "照片格式（JPG·PNG·WEBP·GIF）或大小不符合要求。");
  K("e.rate_limited", "잠시 뒤에 다시 해 주세요. (한 시간에 읽을 수 있는 사진 수를 넘었어요.)", "Please try again in a moment. (You've passed the number of photos that can be read per hour.)", "しばらくしてからもう一度お試しください。（1時間に読み取れる写真の数を超えました。）", "请稍后再试。（已超过每小时可读取的照片数量。）");
  K("e.too_long", "읽을 내용이 너무 많아요. 사진을 나눠서 올려 주세요.", "There's too much to read. Please upload the photos separately.", "読み取る内容が多すぎます。写真を分けてアップロードしてください。", "要读取的内容太多。请分开上传照片。");
  K("e.refused", "AI가 이 사진은 읽지 못한다고 했어요. 다른 사진을 올려 주세요.", "The AI said it can't read this photo. Please upload a different one.", "AIがこの写真は読み取れないと答えました。別の写真をアップロードしてください。", "AI 表示无法读取这张照片。请上传其他照片。");
  K("e.bad_ai_answer", "AI 답을 이해하지 못했어요. 다시 눌러 주세요.", "Couldn't understand the AI's answer. Please press again.", "AIの回答を理解できませんでした。もう一度押してください。", "无法理解 AI 的回答。请再点击一次。");
  K("e.ai_busy", "AI가 지금 바쁘거나 사용 한도에 걸렸어요. 잠시 뒤에 다시 눌러 주세요.", "The AI is busy or has hit its usage limit. Please press again in a moment.", "AIが混み合っているか、利用上限に達しています。しばらくしてからもう一度押してください。", "AI 目前繁忙或已达使用上限。请稍后再点击。");
  K("e.bad_request_to_ai", "AI가 이 요청을 받아들이지 못했어요. 다른 사진으로 해 보고, 계속되면 운영자에게 알려 주세요.", "The AI couldn't accept this request. Try a different photo, and tell the operator if it keeps happening.", "AIがこのリクエストを受け付けられませんでした。別の写真で試し、続く場合は運営者にお知らせください。", "AI 无法接受这个请求。请换一张照片试试，如果持续出现请告知运营者。");
  K("e.blocked", "AI가 이 사진이나 설명으로는 이미지를 만들지 못했어요. 다른 사진으로 해 보세요.", "The AI couldn't make an image from this photo or description. Please try a different photo.", "AIはこの写真や説明では画像を作れませんでした。別の写真で試してください。", "AI 无法根据这张照片或描述生成图片。请换一张照片试试。");
  K("e.daily_limit", "오늘 만들 수 있는 렌더 수를 넘었어요. 내일 다시 해 주세요.", "You've passed today's render limit. Please try again tomorrow.", "本日作れるレンダー数を超えました。明日またお試しください。", "已超过今天可生成的渲染数量。请明天再试。");
  K("e.already_rendering", "이미 렌더를 만드는 중이에요. 끝날 때까지 기다려 주세요.", "A render is already being made. Please wait until it finishes.", "すでにレンダーを作成中です。終わるまでお待ちください。", "已经在生成渲染了。请等待完成。");
  K("e.no_image", "이미지를 받지 못했어요. 다시 해 보세요.", "Didn't receive an image. Please try again.", "画像を受け取れませんでした。もう一度お試しください。", "没有收到图片。请再试一次。");
  K("e.timeout", "만드는 데 시간이 너무 오래 걸렸어요. 잠시 뒤에 다시 해 보세요. (무료 횟수는 차감되지 않았어요.)", "It took too long. Please try again in a moment. (No free render was used.)", "作成に時間がかかりすぎました。しばらくしてからもう一度お試しください。（無料回数は減っていません。）", "生成耗时过长。请稍后再试。（未扣除免费次数。）");
  K("e.ai_failed", "렌더를 만들지 못했어요. 잠시 뒤에 다시 해 보세요. (무료 횟수는 차감되지 않았어요.)", "Couldn't make the render. Please try again in a moment. (No free render was used.)", "レンダーを作れませんでした。しばらくしてからもう一度お試しください。（無料回数は減っていません。）", "无法生成渲染。请稍后再试。（未扣除免费次数。）");
  K("e.ai_not_configured", "서버의 AI 설정에 문제가 있어요. 운영자에게 알려 주세요.", "There's a problem with the server's AI settings. Please tell the operator.", "サーバーのAI設定に問題があります。運営者にお知らせください。", "服务器的 AI 设置有问题。请告知运营者。");
  K("e.free_limit", "무료 횟수를 모두 사용했어요.", "You've used all your free renders.", "無料回数をすべて使い切りました。", "免费次数已全部用完。");

  /* ---- AI 렌더 창 ---- */
  K("d.title", "✦ AI 렌더 만들기", "✦ Make AI render", "✦ AIレンダーを作る", "✦ 生成 AI 渲染");
  K("d.notice",
    "지금 배치한 도면으로 AI가 <b>완성된 방 분위기 이미지 1장</b>을 만들어 줘요. AI가 그린 <b>참고용 시안</b>이라 가구 위치·크기·색이 도면과 조금 다를 수 있고 실제 제품과도 달라요. 도면과 방 사진은 만들기 위해 서버를 거쳐 OpenAI(AI 회사)로 보내지고, 이 서버에는 저장하지 않아요.",
    "From the layout you just made, the AI creates <b>one mood image of the finished room</b>. It's an <b>AI-drawn reference draft</b>, so furniture position, size and color may differ slightly from your plan and from real products. To make it, your plan and room photo are sent through our server to OpenAI (an AI company), and nothing is stored on this server.",
    "今配置した図面から、AIが<b>完成した部屋の雰囲気画像を1枚</b>作ります。AIが描いた<b>参考用の下絵</b>なので、家具の位置・大きさ・色が図面と少し違うことがあり、実際の製品とも異なります。図面と部屋の写真は作成のためサーバー経由でOpenAI（AI企業）に送られ、このサーバーには保存されません。",
    "AI 会根据您刚布置好的平面图生成<b>一张完成后的房间氛围图</b>。这是 <b>AI 绘制的参考草图</b>，家具的位置、大小、颜色可能与平面图略有出入，也与真实产品不同。为了生成图片，平面图和房间照片会经由服务器发送给 OpenAI（AI 公司），且不会保存在本服务器上。");
  K("d.checking", "무료 렌더 남은 횟수를 확인하는 중…", "Checking your remaining free renders…", "無料レンダーの残り回数を確認中…", "正在确认剩余免费次数…");
  K("d.remain", "무료 렌더 {r}회 남았어요 (총 {f}회). 만들 때마다 1회씩 줄어요.", "{r} free render(s) left (of {f}). Each render uses 1.", "無料レンダーはあと{r}回です（全{f}回）。作るたびに1回ずつ減ります。", "还剩 {r} 次免费渲染（共 {f} 次）。每生成一次减少 1 次。");
  K("d.used", "무료 렌더 {f}회를 모두 사용했어요.", "You've used all {f} free renders.", "無料レンダー{f}回をすべて使い切りました。", "{f} 次免费渲染已全部用完。");
  K("d.off", "AI 렌더를 지금은 쓸 수 없어요. (서버에 AI 키가 아직 설정되지 않았거나 잠시 꺼져 있어요.)", "AI Render isn't available right now. (The server's AI key isn't set up yet, or it's temporarily switched off.)", "AIレンダーは今は使えません。（サーバーにAIキーがまだ設定されていないか、一時的にオフになっています。）", "AI 渲染目前无法使用。（服务器尚未设置 AI 密钥，或已暂时关闭。）");
  K("d.404", "이 화면에서는 AI 렌더를 쓸 수 없어요. (배포된 사이트나 「사이트_열기.bat」으로 연 화면에서 써 주세요.)", "AI Render isn't available on this screen. (Use it on the deployed site or a page opened with 「사이트_열기.bat」.)", "この画面ではAIレンダーは使えません。（公開サイトか「사이트_열기.bat」で開いた画面で使ってください。）", "此页面无法使用 AI 渲染。（请在已发布的网站或用「사이트_열기.bat」打开的页面中使用。）");
  K("d.conn", "연결에 실패했어요. 인터넷을 확인하고 창을 다시 열어 주세요.", "Connection failed. Check your internet and reopen this window.", "接続に失敗しました。インターネットを確認してウィンドウを開き直してください。", "连接失败。请检查网络后重新打开此窗口。");
  K("d.mood", "분위기", "Mood", "雰囲気", "氛围");
  K("d.s.modern", "모던 미니멀", "Modern minimal", "モダンミニマル", "现代极简");
  K("d.s.nordic", "북유럽 우드", "Nordic wood", "北欧ウッド", "北欧原木");
  K("d.s.warm", "따뜻한 빈티지", "Warm vintage", "温かみのあるヴィンテージ", "温暖复古");
  K("d.s.hotel", "화이트 호텔식", "White hotel style", "ホワイトのホテルライク", "白色酒店风");
  K("d.s.natural", "내추럴 베이지", "Natural beige", "ナチュラルベージュ", "自然米色");
  K("d.s.custom", "직접 쓰기", "Write your own", "自分で書く", "自己填写");
  K("d.customLabel", "원하는 분위기 (2~40자)", "Mood you want (2–40 characters)", "希望の雰囲気（2〜40文字）", "想要的氛围（2~40 个字）");
  K("d.customPh", "예: 차분한 우드톤, 따뜻한 조명", "e.g. calm wood tones, warm lighting", "例：落ち着いたウッドトーン、温かい照明", "例如：沉稳的木色调、温暖的灯光");
  K("d.photoH", "방 사진 <small>(선택)</small>", "Room photo <small>(optional)</small>", "部屋の写真 <small>（任意）</small>", "房间照片 <small>（可选）</small>");
  K("d.photoBtn", "📷 방 사진 올리기", "📷 Upload a room photo", "📷 部屋の写真をアップロード", "📷 上传房间照片");
  K("d.photoHint", "올리면 그 방의 벽·바닥·창문 느낌을 반영해요. 안 올려도 돼요.", "If you upload one, the walls, floor and windows of that room are reflected. It's fine to skip it.", "アップロードすると、その部屋の壁・床・窓の雰囲気を反映します。なくても大丈夫です。", "上传后会反映那个房间的墙面、地面和窗户的感觉。不上传也可以。");
  K("d.photoAlt", "올린 방 사진", "Uploaded room photo", "アップロードした部屋の写真", "已上传的房间照片");
  K("d.photoDel", "사진 빼기", "Remove photo", "写真を外す", "移除照片");
  K("d.go", "✦ 렌더 만들기", "✦ Make render", "✦ レンダーを作る", "✦ 生成渲染");
  K("d.paid", "무료 렌더를 모두 사용했어요. 유료 이용은 <b>준비 중</b>이에요. <a href='렌더신청.html'>유료 이용 알림 받기 →</a>", "You've used all your free renders. Paid use is <b>being prepared</b>. <a href='렌더신청.html'>Get notified about paid use →</a>", "無料レンダーをすべて使い切りました。有料での利用は<b>準備中</b>です。<a href='렌더신청.html'>有料開始の通知を受け取る →</a>", "免费渲染已全部用完。付费使用<b>正在准备中</b>。<a href='렌더신청.html'>接收付费使用通知 →</a>");
  K("d.resultAlt", "AI가 만든 방 분위기 이미지", "Room mood image made by AI", "AIが作った部屋の雰囲気画像", "AI 生成的房间氛围图");
  K("d.save", "이미지 저장", "Save image", "画像を保存", "保存图片");
  K("d.resultHint", "AI가 그린 참고용 시안이에요. 마음에 안 들면 분위기를 바꿔 다시 만들 수 있어요. (다시 만들면 무료 횟수가 1회 줄어요.)", "This is an AI-drawn reference draft. If you don't like it, change the mood and make it again. (Making it again uses up 1 free render.)", "AIが描いた参考用の下絵です。気に入らなければ、雰囲気を変えて作り直せます。（作り直すと無料回数が1回減ります。）", "这是 AI 绘制的参考草图。不满意的话，可以换个氛围重新生成。（重新生成会减少 1 次免费次数。）");
  K("d.noFurn", "방 안에 놓은 가구가 없어요. 가구를 방 안에 놓은 뒤에 만들어 주세요.", "There's no furniture inside the room. Place furniture inside the room, then try again.", "部屋の中に置いた家具がありません。家具を部屋の中に置いてから作ってください。", "房间内没有摆放家具。请先把家具放进房间再生成。");
  K("d.badStyle", "분위기 글은 2~40자의 글자·숫자·쉼표만 쓸 수 있어요.", "The mood text can only use 2–40 letters, numbers and commas.", "雰囲気のテキストは2〜40文字の文字・数字・カンマのみ使えます。", "氛围文字只能使用 2~40 个字母、数字和逗号。");
  K("d.making", "만드는 중이에요… (보통 30초~2분 걸려요. 창을 닫지 마세요.)", "Making it… (usually 30 seconds to 2 minutes — please don't close this window.)", "作成中です…（通常30秒〜2分かかります。ウィンドウを閉じないでください。）", "生成中…（通常需要 30 秒到 2 分钟，请不要关闭窗口。）");
  K("d.makingS", "만드는 중이에요… {s}초 (보통 30초~2분 걸려요. 창을 닫지 마세요.)", "Making it… {s}s (usually 30 seconds to 2 minutes — please don't close this window.)", "作成中です…{s}秒（通常30秒〜2分かかります。ウィンドウを閉じないでください。）", "生成中… {s} 秒（通常需要 30 秒到 2 分钟，请不要关闭窗口。）");
  K("d.done", "완성! 아래 이미지를 확인하세요.", "Done! Check the image below.", "完成！下の画像をご確認ください。", "完成！请查看下方图片。");
  K("d.skipped", " (방 밖에 둔 가구 {n}개는 빼고 만들었어요.)", " (Left out {n} piece(s) of furniture placed outside the room.)", "（部屋の外に置いた家具{n}個は除いて作りました。）", "（房间外的 {n} 件家具已排除。）");
  K("d.big", "사진이 너무 커요. 더 작은 방 사진으로 해 주세요.", "The photo is too large. Please use a smaller room photo.", "写真が大きすぎます。もっと小さい部屋の写真にしてください。", "照片太大了。请换一张更小的房间照片。");
  K("d.fail", "렌더를 만들지 못했어요. 잠시 뒤에 다시 해 보세요.", "Couldn't make the render. Please try again in a moment.", "レンダーを作れませんでした。しばらくしてからもう一度お試しください。", "无法生成渲染。请稍后再试。");
  K("d.abort", "시간이 너무 오래 걸려서 멈췄어요. 잠시 뒤에 다시 해 보세요.", "It took too long and was stopped. Please try again in a moment.", "時間がかかりすぎて停止しました。しばらくしてからもう一度お試しください。", "耗时过长，已停止。请稍后再试。");
  K("d.photoType", "방 사진은 JPG·PNG·WEBP 파일만 올릴 수 있어요.", "Room photos must be JPG, PNG or WEBP files.", "部屋の写真はJPG・PNG・WEBPファイルのみアップロードできます。", "房间照片只能上传 JPG·PNG·WEBP 文件。");
  K("d.photoBig", "사진이 너무 커요(20MB 넘음). 더 작은 사진으로 해 주세요.", "The photo is too large (over 20MB). Please use a smaller one.", "写真が大きすぎます（20MB超）。もっと小さい写真にしてください。", "照片太大了（超过 20MB）。请换一张更小的照片。");
  K("d.photoOk", "방 사진을 넣었어요. 렌더에 이 방의 느낌이 반영돼요.", "Room photo added. The render will reflect this room's feel.", "部屋の写真を入れました。レンダーにこの部屋の雰囲気が反映されます。", "已添加房间照片。渲染会反映这个房间的感觉。");
  K("d.photoBad", "이 사진은 열 수 없어요. 다른 사진으로 해 주세요.", "This photo can't be opened. Please use a different one.", "この写真は開けません。別の写真にしてください。", "无法打开这张照片。请换一张。");

  /* ---- 렌더 후 가구 찾아보기 (검색 링크) ---- */
  K("d.recTitle", "이 방에 어울리는 가구 찾아보기", "Find furniture for this room", "この部屋に合う家具を探す", "为这个房间找家具");
  K("d.recHint",
    "렌더 분위기와 내가 놓은 가구를 바탕으로 만든 검색어예요. 누르면 쇼핑몰의 검색 결과로 이동해요. 어떤 상품이 나오는지, 가격·재고는 판매처에서 확인하세요. 직접 첨부한 가구는 이미 정해진 가구라 뺐어요.",
    "These search terms are built from the render's mood and the furniture you placed. Each link opens the shop's search results — check the products, prices and stock on the shop itself. Furniture you attached yourself is left out, since it's already decided.",
    "レンダーの雰囲気と、置いた家具をもとに作った検索ワードです。押すとショップの検索結果に移動します。どんな商品が出るか、価格・在庫は販売元でご確認ください。ご自分で添付した家具はすでに決まっているので除いています。",
    "这些搜索词是根据渲染氛围和您摆放的家具生成的。点击后会跳转到商城的搜索结果页。具体有哪些商品、价格和库存请在商家页面确认。您自己上传的家具已经确定，所以不包含在内。");
  K("d.recKw", "검색어: {q}", "Search: {q}", "検索ワード：{q}", "搜索词：{q}");
  K("d.recSize", "배치한 크기 {w}×{h}cm", "Placed size {w}×{h} cm", "配置したサイズ {w}×{h}cm", "摆放尺寸 {w}×{h}cm");
  K("d.recMore", "렌더 이미지에 보이는 소품(조명·러그·커튼 등)까지 찾아 주는 「추가 서치」는 준비 중이에요. (유료로 제공할 예정이에요)", "“Extra search” for the small items you see in the render (lamps, rugs, curtains, etc.) is being prepared. (It will be offered as a paid option.)", "レンダー画像に見える小物（照明・ラグ・カーテンなど）まで探す「追加検索」は準備中です。（有料での提供を予定しています）", "为渲染图中看到的小物件（灯具、地毯、窗帘等）查找的「追加搜索」正在准备中。（计划作为付费功能提供）");
  K("d.shopNaver", "네이버쇼핑", "Naver Shopping", "ネイバーショッピング", "Naver 购物");
  K("d.shopCoupang", "쿠팡", "Coupang", "クーパン", "Coupang");
  K("d.shopGoogle", "구글 쇼핑", "Google Shopping", "Google ショッピング", "Google 购物");

  /* ===================== 집 전체 도면 (집도면.html) ===================== */
  K("title.house", "방 만들기 · 집 전체 도면", "Room Maker · Whole-home plan", "部屋づくり · 家全体の間取り", "布置房间 · 整套房子户型图");
  K("h.h1", "집 전체 도면 위에<br>가구를 놓아 보세요", "Place furniture on<br>your whole-home plan", "家全体の間取り図の上に<br>家具を置いてみましょう", "在整套房子的户型图上<br>摆放家具");
  K("h.lead",
    "집 도면 사진을 올리고, 길이를 아는 곳 두 점을 찍어 축척을 맞추면 사진 위에 가구를 실제 크기로 놓아 볼 수 있어요. 도면 사진은 이 기기 안에서만 쓰이고 서버로 보내지 않아요.",
    "Upload a photo of your home's floor plan, click two points whose real distance you know to set the scale, and you can place furniture on the photo at its real size. The plan photo stays on this device and is never sent to a server.",
    "家の間取り図の写真をアップロードし、実際の長さがわかる2点をクリックして縮尺を合わせると、写真の上に家具を実寸で置いて試せます。図面の写真はこの端末の中だけで使われ、サーバーには送信されません。",
    "上传户型图照片，点击两个已知实际长度的点来校准比例尺，就可以在照片上按实际大小摆放家具。户型图照片只在此设备内使用，不会发送到服务器。");
  K("h.s1", "1. 도면 사진 올리기", "1. Upload the plan photo", "1. 図面の写真をアップロード", "1. 上传户型图照片");
  K("h.upload", "📷 도면 사진 올리기", "📷 Upload plan photo", "📷 図面の写真をアップロード", "📷 上传户型图照片");
  K("h.s1hint", "집 전체가 보이는 도면 사진(JPG·PNG·WEBP)을 올려 주세요.", "Upload a photo of the whole-home plan (JPG, PNG or WEBP).", "家全体が見える図面の写真（JPG・PNG・WEBP）をアップロードしてください。", "请上传能看到整套房子的户型图照片（JPG·PNG·WEBP）。");
  K("h.imgOk", "도면 사진을 넣었어요. 이제 2단계에서 축척을 맞춰 주세요.", "Plan photo added. Now set the scale in step 2.", "図面の写真を入れました。次に2のステップで縮尺を合わせてください。", "已添加户型图照片。接下来请在第 2 步校准比例尺。");
  K("h.imgBad", "이 사진은 열 수 없어요. JPG·PNG·WEBP 사진으로 해 주세요.", "This photo can't be opened. Please use a JPG, PNG or WEBP photo.", "この写真は開けません。JPG・PNG・WEBPの写真にしてください。", "无法打开这张照片。请使用 JPG·PNG·WEBP 照片。");
  K("h.imgBig", "사진이 너무 커요(20MB 넘음). 더 작은 사진으로 해 주세요.", "The photo is too large (over 20MB). Please use a smaller one.", "写真が大きすぎます（20MB超）。もっと小さい写真にしてください。", "照片太大了（超过 20MB）。请换一张更小的照片。");
  K("h.confirmNewImg", "새 도면 사진을 올리면 지금 놓은 가구와 축척이 지워져요. 계속할까요?", "Uploading a new plan photo will clear the furniture and scale you set. Continue?", "新しい図面の写真をアップロードすると、今置いた家具と縮尺が消えます。続けますか？", "上传新的户型图照片会清除当前摆放的家具和比例尺。要继续吗？");
  K("h.confirmRmImg", "도면 사진과 놓은 가구를 모두 지울까요? 되돌릴 수 없어요.", "Remove the plan photo and all placed furniture? This can't be undone.", "図面の写真と置いた家具をすべて消しますか？元に戻せません。", "要删除户型图照片和所有已摆放的家具吗？此操作无法撤销。");
  K("h.s2", "2. 축척 맞추기", "2. Set the scale", "2. 縮尺を合わせる", "2. 校准比例尺");
  K("h.calibBtn", "📏 두 점 찍어서 길이 재기", "📏 Click two points to measure", "📏 2点をクリックして長さを測る", "📏 点击两点来量长度");
  K("h.calibRe", "📏 축척 다시 맞추기", "📏 Set the scale again", "📏 縮尺を合わせ直す", "📏 重新校准比例尺");
  K("h.calibHint0", "도면에서 실제 길이를 아는 곳(예: 문 폭 90cm, 방 한 변)의 양 끝을 차례로 눌러 주세요.", "On the plan, click the two ends of something whose real length you know (e.g. a 90 cm door, one side of a room).", "図面で実際の長さがわかる場所（例：幅90cmのドア、部屋の一辺）の両端を順番にクリックしてください。", "请在户型图上依次点击一处已知实际长度的位置的两端（例如 90cm 的门宽、房间的一条边）。");
  K("h.calibHint1", "첫 번째 점을 찍었어요. 두 번째 점을 눌러 주세요.", "First point placed. Click the second point.", "1つ目の点を打ちました。2つ目の点をクリックしてください。", "已标出第一个点。请点击第二个点。");
  K("h.calibHint2", "두 점을 찍었어요. 아래 칸에 두 점 사이의 실제 길이를 적고 「적용」을 눌러 주세요.", "Both points are set. Enter their real distance below and press “Apply.”", "2点を打ちました。下の欄に2点間の実際の長さを入力して「適用」を押してください。", "两个点都标好了。请在下方填入两点间的实际长度，然后点击「应用」。");
  K("h.calibAsk", "두 점 사이의 실제 길이 (cm)", "Real distance between the two points (cm)", "2点間の実際の長さ (cm)", "两点之间的实际长度 (cm)");
  K("h.calibApply", "적용", "Apply", "適用", "应用");
  K("h.calibCancel", "취소", "Cancel", "キャンセル", "取消");
  K("h.scaleOk", "축척이 맞춰졌어요 (도면에서 1m ≈ {px}px). 이제 가구를 실제 크기로 놓을 수 있어요.", "Scale set (1 m ≈ {px}px on the plan). You can now place furniture at its real size.", "縮尺が合いました（図面で1m ≈ {px}px）。これで家具を実寸で置けます。", "比例尺已校准（图上 1m ≈ {px}px）。现在可以按实际大小摆放家具了。");
  K("h.scaleNo", "아직 축척을 맞추지 않았어요. 축척을 맞춰야 가구를 실제 크기로 놓을 수 있어요.", "The scale isn't set yet. You need to set it to place furniture at its real size.", "まだ縮尺を合わせていません。縮尺を合わせると家具を実寸で置けます。", "尚未校准比例尺。校准后才能按实际大小摆放家具。");
  K("h.calibBad", "길이는 10~10000cm 사이 숫자로 적어 주세요.", "Please enter a length between 10 and 10000 cm.", "長さは10〜10000cmの数字で入力してください。", "请填写 10~10000cm 之间的数字。");
  K("h.calibShort", "두 점이 너무 가까워요. 더 멀리 떨어진 두 점을 찍어 주세요.", "The two points are too close. Please pick two points farther apart.", "2点が近すぎます。もっと離れた2点を選んでください。", "两个点离得太近了。请选择距离更远的两点。");
  K("h.s3", "3. 가구 놓기", "3. Place furniture", "3. 家具を置く", "3. 摆放家具");
  K("h.s3hint", "누르면 도면 가운데에 놓여요. 끌어서 원하는 방으로 옮기세요. (치수는 예시 값)", "Click to drop it in the middle of the plan, then drag it to the room you want. (Sizes are examples)", "押すと図面の真ん中に置かれます。ドラッグして好きな部屋へ動かしてください。（寸法は例の値）", "点击后会放在户型图中央，再拖到想要的房间。（尺寸为示例值）");
  K("h.needScale", "먼저 사진을 올리고 축척을 맞춰 주세요.", "Please upload a photo and set the scale first.", "先に写真をアップロードして縮尺を合わせてください。", "请先上传照片并校准比例尺。");
  K("h.empty", "도면 사진을 올리면 여기에 보여요.", "Your plan photo will appear here once you upload it.", "図面の写真をアップロードすると、ここに表示されます。", "上传户型图照片后会显示在这里。");
  K("h.svg", "집 전체 도면 위 가구 배치", "Furniture layout on the whole-home plan", "家全体の間取り図の上の家具配置", "整套房子户型图上的家具布局");
  K("h.note", "도면 속 벽은 인식하지 못해요. 겹침(빨간 테두리)만 알려 드리고, 문이 열리는 자리와 통로는 직접 확인해 주세요. 가구를 끌어서 옮기고, 컴퓨터에서는 방향키(5cm씩)와 Delete 키도 쓸 수 있어요.", "Walls in the plan aren't detected. We only flag overlaps (red outline), so please check door swing areas and walkways yourself. Drag furniture to move it; on a computer you can also use the arrow keys (5 cm steps) and Delete.", "図面の壁は認識できません。重なり（赤い枠）だけをお知らせしますので、ドアが開く場所と通路はご自身で確認してください。家具はドラッグで動かせ、パソコンでは矢印キー（5cmずつ）とDeleteキーも使えます。", "无法识别户型图中的墙体。只会提示重叠（红框），开门的空间和通道请自行确认。拖动家具即可移动；在电脑上也可以用方向键（每次 5cm）和 Delete 键。");
  K("h.save", "저장", "Save", "保存", "保存");
  K("h.png", "도면 + 가구 그림 저장 (PNG)", "Save plan + furniture image (PNG)", "図面＋家具の画像を保存（PNG）", "保存户型图+家具图片（PNG）");
  K("h.rmImg", "도면 사진 지우기", "Remove plan photo", "図面の写真を消す", "删除户型图照片");
  K("h.saved", "작업 내용(가구 위치·축척·도면 사진)은 이 기기의 브라우저에 자동 저장돼요. 사진이 너무 커서 저장되지 않으면 다음에 다시 올려 주세요.", "Your work (furniture positions, scale and plan photo) is saved automatically in this device's browser. If the photo is too large to save, please upload it again next time.", "作業内容（家具の位置・縮尺・図面の写真）はこの端末のブラウザに自動保存されます。写真が大きすぎて保存されない場合は、次回もう一度アップロードしてください。", "作业内容（家具位置、比例尺、户型图照片）会自动保存在此设备的浏览器中。如果照片太大无法保存，下次请重新上传。");
  K("h.fileName", "방만들기_집전체도면.png", "RoomMaker_whole_home.png", "部屋づくり_家全体.png", "布置房间_整套房子.png");

  /* ===================== 동작 ===================== */
  function valid(l) { for (var i = 0; i < LANGS.length; i++) if (LANGS[i][0] === l) return true; return false; }
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function write(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  var lang = "ko";
  var fromUrl = (/[?&]lang=([a-z]{2})/.exec(location.search) || [])[1];
  if (fromUrl && valid(fromUrl)) lang = fromUrl;          // 주소로 지정하면 저장하지 않고 이번에만 적용
  else if (valid(read(STORE))) lang = read(STORE);

  function t(key, params) {
    var s = D[lang][key];
    if (s === undefined) s = D.ko[key];
    if (s === undefined) return key;
    var p = params || {};
    return s.replace(/\{(\w+)\}/g, function (m, name) {
      if (p[name] !== undefined) return p[name];
      if (name === "n" && typeof CFG.freeRenders === "number") return String(CFG.freeRenders);   // {n} 의 기본값: 무료 렌더 횟수
      return m;
    });
  }
  function has(key) { return D.ko[key] !== undefined; }
  function nameOf(koName) { return has("n." + koName) ? t("n." + koName) : koName; }   // 가구 이름 번역 (없으면 그대로)
  function groupOf(koGroup) { return has("g." + koGroup) ? t("g." + koGroup) : koGroup; }

  function apply(root) {
    root = root || document;
    var i, el, list;
    list = root.querySelectorAll("[data-i18n]");
    for (i = 0; i < list.length; i++) { el = list[i]; el.textContent = t(el.getAttribute("data-i18n")); }
    list = root.querySelectorAll("[data-i18n-html]");
    for (i = 0; i < list.length; i++) { el = list[i]; el.innerHTML = t(el.getAttribute("data-i18n-html")); }
    list = root.querySelectorAll("[data-i18n-attr]");
    for (i = 0; i < list.length; i++) {
      el = list[i];
      el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var at = pair.indexOf(":");
        if (at > 0) el.setAttribute(pair.slice(0, at).trim(), t(pair.slice(at + 1).trim()));
      });
    }
  }

  var switcher = null;
  function buildSwitcher() {
    var host = document.querySelector(".top-right");
    if (!host || switcher) return;
    switcher = document.createElement("div");
    switcher.className = "lang";
    switcher.setAttribute("role", "group");
    LANGS.forEach(function (L) {
      var b = document.createElement("button");
      b.type = "button"; b.setAttribute("data-lang", L[0]); b.setAttribute("lang", L[0]);
      b.innerHTML = "<span class='full'>" + L[1] + "</span><span class='short' aria-hidden='true'>" + L[2] + "</span>";
      b.setAttribute("aria-label", L[1]);
      b.addEventListener("click", function () { setLang(L[0]); });
      switcher.appendChild(b);
    });
    host.appendChild(switcher);
  }
  function markSwitcher() {
    if (!switcher) return;
    switcher.setAttribute("aria-label", t("lang.label"));
    Array.prototype.forEach.call(switcher.querySelectorAll("button"), function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-lang") === lang ? "true" : "false");
    });
  }

  function setLang(next, silent) {
    if (!valid(next)) return;
    lang = next;
    if (!silent) write(STORE, next);
    document.documentElement.lang = next;
    apply(document);
    markSwitcher();
    document.dispatchEvent(new CustomEvent("roommaker:lang", { detail: { lang: next } }));
  }

  window.I18N = {
    t: t, has: has, name: nameOf, group: groupOf, apply: apply, setLang: setLang,
    get lang() { return lang; },
    onChange: function (fn) { document.addEventListener("roommaker:lang", fn); }
  };

  buildSwitcher();
  document.documentElement.lang = lang;
  apply(document);
  markSwitcher();
})();
