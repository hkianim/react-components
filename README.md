# DataTable

کامپوننت عمومی جدول اطلاعات بر پایه React و Material UI، با قابلیت صفحه‌بندی و مرتب‌سازی سمت سرور، انتخاب ردیف، عملیات اختصاصی، قالب‌بندی داده‌ها و مدیریت واکنش‌گرای عرض ستون‌ها.

## ویژگی‌ها

- مستقل از API و لایه دریافت اطلاعات
- پشتیبانی از صفحه‌بندی سمت سرور
- پشتیبانی از مرتب‌سازی سمت سرور
- انتخاب تک‌ردیفی به‌صورت Controlled
- عملیات پیش‌فرض و سفارشی برای ردیف‌ها
- قالب‌بندی متن، عدد، مبلغ، درصد و تاریخ
- امکان رندر سفارشی سلول‌ها
- تعیین حداقل و حداکثر عرض ستون‌ها
- توزیع خودکار فضای اضافه بین ستون‌ها
- پشتیبانی از دو حالت `scroll` و `shrink`
- تنظیم واکنش‌گرای `columnFit`
- امکان شخصی‌سازی کامل استایل ردیف‌ها
- مدیریت وضعیت‌های بارگذاری، دریافت مجدد، خطا و خالی بودن اطلاعات
- نمایش یکسان جدول در دسکتاپ و موبایل همراه با اسکرول افقی

## ساختار پوشه

```text
data-table/
├── index.jsx
└── README.md
```

## وابستگی‌ها

- React
- `@mui/material`
- `@mui/icons-material`

---

## نحوه استفاده

```jsx
import { DataTable } from '@hkianim/react-components';

function MachinesPage() {
    const columns = [
        {
            field: "machineName",
            caption: "نام ماشین‌آلات",
            minWidth: 180,
            sortable: true,
        },
        {
            field: "dailyIncome",
            caption: "درآمد روزانه",
            minWidth: 140,
            alignment: "end",
            format: "currency",
        },
    ];

    const rows = [
        {
            id: 1,
            machineName: "بیل مکانیکی کوماتسو",
            dailyIncome: 8500000,
        },
    ];

    return (
        <DataTable
            columns={columns}
            rows={rows}
            pagination={{
                page: 1,
                pageSize: 20,
                total: 1,
            }}
            onPaginationChange={(value) => {
                console.log(value);
            }}
        />
    );
}
```

---

## Props

### اطلاعات جدول

| ویژگی | نوع | پیش‌فرض | توضیحات |
|---|---|---|---|
| `columns` | `Array` | `[]` | تعریف ستون‌های جدول |
| `rows` | `Array` | `[]` | اطلاعات ردیف‌ها |
| `getRowId` | `Function` | `(row) => row.id` | استخراج شناسه ردیف |

### columns

هر ستون با آبجکتی شامل مشخصات زیر تعریف می‌شود:

| ویژگی | نوع | پیش‌فرض | توضیحات |
|---|---|---|---|
| `field` | `string` | — | نام فیلد متناظر در ردیف |
| `caption` | `string` | — | عنوان ستون |
| `width` | `number` | `150` | عرض پایه ستون بر حسب پیکسل |
| `minWidth` | `number` | `0` | حداقل عرض ستون |
| `maxWidth` | `number` | بدون محدودیت | حداکثر عرض ستون |
| `dir` | `string` | `auto` | جهت متن: `rtl`، `ltr` یا `auto` |
| `alignment` | `string` | `start` | تراز متن: `start`، `center` یا `end` |
| `format` | `string / object / function` | `text` | قالب‌بندی مقدار |
| `sortable` | `boolean` | `false` | امکان مرتب‌سازی ستون |
| `hidden` | `boolean` | `false` | مخفی کردن ستون |
| `renderCell` | `Function` | `null` | رندر سفارشی سلول |

نکات:

- `field` باید در تمام ردیف‌ها با نام یکسان وجود داشته باشد.
- `field` ستون‌ها باید یکتا باشد.
- در نسخه فعلی، فیلدهای تو در تو مانند `owner.fullName` پشتیبانی نمی‌شوند.
- ترتیب ستون‌ها در آرایه، ترتیب نمایش آن‌ها است.
- `hidden` صرفاً ستون را از نمایش خارج می‌کند و داده آن را حذف نمی‌کند.
- در صورت مخفی شدن تمام ستون‌ها، کامپوننت اعتبارسنجی خودکاری انجام نمی‌دهد؛ حداقل یک ستون باید قابل نمایش باشد.

### getRowId

تابعی برای استخراج شناسه یکتای هر ردیف:

```jsx
getRowId={(row) => row.id}
```

این ویژگی اختیاری است و در صورت عدم ارسال، از `row.id` استفاده می‌شود.

شناسه باید بین ردیف‌ها یکتا و پایدار باشد.

---

## قالب‌بندی مقادیر (format)

ویژگی `format` سه حالت دارد.

### ۱. قالب‌های استاندارد

| مقدار | توضیحات |
|---|---|
| `text` | متن |
| `number` | عدد |
| `currency` | مبلغ |
| `percent` | درصد |
| `date` | تاریخ شمسی |
| `datetime` | تاریخ و ساعت شمسی |

مثال:

```jsx
{
    field: "dailyIncome",
    caption: "درآمد روزانه",
    format: "currency",
}
```

### ۲. آبجکت تنظیمات

برای تعیین تنظیمات اختصاصی می‌توان از آبجکت استفاده کرد.

```jsx
{
    field: "fuelConsumption",
    caption: "مصرف سوخت",
    format: {
        type: "number",
        maximumFractionDigits: 2,
    },
}
```

در این حالت، تنظیمات مستقیماً به `Intl.NumberFormat` یا `Intl.DateTimeFormat` منتقل می‌شوند.

مثال مبلغ:

```jsx
{
    field: "price",
    caption: "مبلغ",
    format: {
        type: "currency",
        currency: "IRR",
        maximumFractionDigits: 0,
    },
}
```

برای ارز، اگر `currency` در تنظیمات وجود نداشته باشد، از `column.currency` و در صورت نبود آن از `IRR` استفاده می‌شود.

مثال تاریخ:

```jsx
{
    field: "createdAt",
    caption: "تاریخ ثبت",
    format: {
        type: "date",
        year: "numeric",
        month: "long",
        day: "numeric",
    },
}
```

تقویم تاریخ و تاریخ‌زمان از نوع فارسی (`fa-IR-u-ca-persian`) است.

برای `datetime`، نمایش ساعت و دقیقه نیز به‌صورت پیش‌فرض فعال است.

### ۳. تابع سفارشی

```jsx
{
    field: "status",
    caption: "وضعیت",
    format: (value, row, context) => {
        return value === "active" ? "فعال" : "غیرفعال";
    },
}
```

امضای تابع:

```jsx
(value, row, context) => result
```

در این حالت، تابع مستقیماً مقدار موردنظر را تولید می‌کند.

اگر مقدار `null`، `undefined` یا رشته خالی باشد، قبل از اجرای formatter مقدار `—` برگردانده می‌شود.

---

## رندر سفارشی سلول (renderCell)

در صورت نیاز به نمایش محتوای پیچیده‌تر، می‌توان از `renderCell` استفاده کرد.

```jsx
{
    field: "status",
    caption: "وضعیت",
    renderCell: (value, row, context) => (
        <Chip
            label={value === "active" ? "فعال" : "غیرفعال"}
            color={value === "active" ? "success" : "default"}
            size="small"
        />
    ),
}
```

امضای تابع:

```jsx
(value, row, context) => ReactNode
```

در صورت تعریف `renderCell`، این تابع بر `format` اولویت دارد.

ساختار `context`:

| ویژگی | توضیحات |
|---|---|
| `column` | مشخصات ستون |
| `selected` | وضعیت انتخاب ردیف |
| `formatValue(value)` | قالب‌بندی مقدار با تنظیمات همان ستون |

مثال استفاده از قالب‌بندی در رندر سفارشی:

```jsx
renderCell: (value, row, context) => (
    <Typography>
        {context.formatValue(value)}
    </Typography>
)
```

---

## صفحه‌بندی (pagination)

صفحه‌بندی سمت سرور انجام می‌شود و وضعیت آن در کامپوننت والد نگهداری می‌شود.

| ویژگی | نوع | پیش‌فرض |
|---|---|---|
| `page` | `number` | `1` |
| `pageSize` | `number` | `20` |
| `total` | `number` | `0` |

ساختار:

```jsx
const pagination = {
    page: 1,
    pageSize: 20,
    total: 1250,
};
```

شماره صفحه در API عمومی از ۱ شروع می‌شود.

گزینه‌های تعداد ردیف در هر صفحه:

```jsx
[10, 20, 50, 100]
```

### onPaginationChange

هنگام تغییر صفحه یا تعداد ردیف‌ها فراخوانی می‌شود:

```jsx
onPaginationChange={({ page, pageSize }) => {
    setPagination((previous) => ({
        ...previous,
        page,
        pageSize,
    }));
}}
```

قواعد:

- تغییر صفحه، `pageSize` فعلی را حفظ می‌کند.
- تغییر تعداد ردیف‌ها، صفحه را به ۱ برمی‌گرداند.
- تبدیل شماره صفحه به مبنای صفر فقط در داخل کامپوننت و هنگام ارتباط با MUI انجام می‌شود.
- دریافت اطلاعات صفحه جدید بر عهده والد است.

`pagination` به‌صورت پیش‌فرض فعال است. برای حذف بخش صفحه‌بندی می‌توان مقدار `null` ارسال کرد.

---

## مرتب‌سازی (sorting)

مرتب‌سازی به‌صورت سمت سرور انجام می‌شود.

ساختار:

```jsx
const sorting = [
    {
        field: "machineName",
        direction: "asc",
    },
];
```

ویژگی‌های هر عضو:

| ویژگی | نوع | توضیحات |
|---|---|---|
| `field` | `string` | نام فیلد |
| `direction` | `string` | جهت مرتب‌سازی: `asc` یا `desc` |

### onSortChange

```jsx
onSortChange={(newSorting) => {
    setSorting(newSorting);
}}
```

رفتار کلیک روی عنوان ستون:

1. کلیک اول: صعودی (`asc`)
2. کلیک دوم: نزولی (`desc`)
3. کلیک سوم: لغو مرتب‌سازی (`[]`)

نکات:

- فقط ستون‌های دارای `sortable: true` قابل مرتب‌سازی هستند.
- رابط کاربری فعلی فقط مرتب‌سازی تک‌ستونی دارد.
- قرارداد `sorting` به‌صورت آرایه است تا توسعه مرتب‌سازی چندستونی در آینده امکان‌پذیر باشد.
- در پیاده‌سازی فعلی، فقط اولین عضو آرایه `sorting` برای نمایش وضعیت مرتب‌سازی استفاده می‌شود.
- با تغییر مرتب‌سازی، در صورت قرار داشتن در صفحه‌ای غیر از صفحه اول، callback صفحه‌بندی نیز برای بازگشت به صفحه ۱ فراخوانی می‌شود.

---

## انتخاب ردیف (selection)

انتخاب ردیف به‌صورت Controlled است.

### selectedRowId

شناسه ردیف انتخاب‌شده:

```jsx
selectedRowId={selectedRowId}
```

مقدار پیش‌فرض `null` است.

### onRowSelect

```jsx
onRowSelect={(rowId, row) => {
    setSelectedRowId(rowId);
}}
```

امضای تابع:

```jsx
(rowId, row) => {}
```

رفتار:

- کلیک روی ردیف، آن را انتخاب می‌کند.
- کلیک مجدد روی همان ردیف، انتخاب را لغو می‌کند.
- کلیک روی ردیف دیگر، انتخاب قبلی را جایگزین می‌کند.
- هنگام لغو انتخاب، هر دو مقدار `null` هستند.

---

## عملیات ردیف‌ها (operations)

عملیات هر ردیف از طریق `operations` تعریف می‌شود.

مقدار پیش‌فرض:

```jsx
["edit", "delete"]
```

عملیات آماده:

| کلید | عنوان پیش‌فرض | رنگ پیش‌فرض |
|---|---|---|
| `edit` | ویرایش | `default` |
| `delete` | حذف | `error` |

### غیرفعال کردن ستون عملیات

```jsx
operations={[]}
```

### تغییر مشخصات عملیات آماده

```jsx
operations={[
    {
        key: "edit",
        label: "ویرایش اطلاعات",
    },
    "delete",
]}
```

مشخصات پیش‌فرض عملیات آماده با مقادیر ارسال‌شده جایگزین می‌شوند.

### تعریف عملیات سفارشی

```jsx
import SearchIcon from "@mui/icons-material/Search";

operations={[
    "edit",
    {
        key: "search",
        label: "مشاهده جزئیات",
        icon: <SearchIcon />,
        color: "success",
        visible: (row) => row.status === "active",
        disabled: (row) => false,
    },
    "delete",
]}
```

ویژگی‌های عملیات:

| ویژگی | نوع | پیش‌فرض | توضیحات |
|---|---|---|---|
| `key` | `string` | — | شناسه عملیات |
| `label` | `string` | — | عنوان عملیات و Tooltip |
| `icon` | `ReactNode` | — | آیکون عملیات |
| `color` | `string` | `default` | رنگ دکمه |
| `visible` | `boolean / function` | `true` | کنترل نمایش |
| `disabled` | `boolean / function` | `false` | کنترل غیرفعال بودن |

رنگ‌های قابل استفاده:

`default`, `primary`, `secondary`, `error`, `success`, `warning`, `info`

توابع `visible` و `disabled` با دریافت ردیف اجرا می‌شوند:

```jsx
(row) => boolean
```

نکات:

- ترتیب عملیات در آرایه، ترتیب نمایش آن‌ها است.
- برای عملیات سفارشی باید `key`، `label` و `icon` تعریف شوند.
- کلید عملیات باید در کل آرایه یکتا باشد.
- کامپوننت در نسخه فعلی یکتا بودن کلیدها را اعتبارسنجی نمی‌کند.
- دکمه‌ها به‌صورت آیکونی نمایش داده می‌شوند.
- عنوان عملیات با Tooltip نمایش داده می‌شود.
- Tooltip حتی در حالت غیرفعال بودن دکمه نیز قابل مشاهده است.
- عملیات به‌صورت خودکار اجرا نمی‌شوند؛ اجرای آن‌ها بر عهده والد است.

### onOperation

هنگام کلیک روی عملیات:

```jsx
onOperation={(key, row) => {
    if (key === "edit") {
        console.log("Edit:", row);
    }

    if (key === "delete") {
        console.log("Delete:", row);
    }
}}
```

امضای تابع:

```jsx
(key, row) => {}
```

هنگام کلیک روی عملیات، ابتدا در صورت نیاز ردیف انتخاب می‌شود و سپس `onOperation` فراخوانی می‌شود.

---

## شخصی‌سازی استایل ردیف‌ها (getRowSx)

برای تعیین استایل اختصاصی هر ردیف:

```jsx
getRowSx={(row, context) => ({
    backgroundColor:
        row.status === "inactive"
            ? "#fff3f3"
            : undefined,

    opacity: context.selected ? 0.8 : 1,
})}
```

امضای تابع:

```jsx
(row, context) => sxObject
```

ویژگی‌های `context`:

| ویژگی | نوع | توضیحات |
|---|---|---|
| `selected` | `boolean` | انتخاب شدن ردیف |
| `hovered` | `boolean` | قرار گرفتن نشانگر روی ردیف |
| `formatValue` | `function` | قالب‌بندی مقدار با تنظیمات ستون |

امضای `formatValue` در این context:

```jsx
formatValue(value, column)
```

نکته مهم:

در صورت تعریف `getRowSx`، استایل خروجی تابع به‌طور کامل جایگزین استایل پیش‌فرض ردیف می‌شود. بنابراین کنترل وضعیت انتخاب و hover نیز در اختیار والد است.

در صورت عدم تعریف این تابع، استایل پیش‌فرض کامپوننت اعمال می‌شود.

---

## وضعیت‌های جدول

| ویژگی | نوع | پیش‌فرض | توضیحات |
|---|---|---|---|
| `loading` | `boolean` | `false` | بارگذاری اولیه |
| `fetching` | `boolean` | `false` | دریافت مجدد اطلاعات |
| `error` | `boolean` | `false` | وضعیت خطا |
| `errorMessage` | `string` | پیام پیش‌فرض | متن خطا |
| `emptyMessage` | `string` | پیام پیش‌فرض | متن نبود اطلاعات |

مقادیر پیش‌فرض پیام‌ها:

```text
errorMessage:
خطایی در دریافت اطلاعات رخ داده است.

emptyMessage:
اطلاعاتی برای نمایش وجود ندارد
```

### loading

- سربرگ جدول باقی می‌ماند.
- بدنه جدول با پیام بارگذاری و CircularProgress جایگزین می‌شود.

### fetching

- اطلاعات قبلی در جدول باقی می‌مانند.
- یک LinearProgress در بالای جدول نمایش داده می‌شود.
- این نشانگر فقط زمانی نمایش داده می‌شود که `loading` و `error` غیرفعال باشند و ردیف‌هایی برای نمایش وجود داشته باشند.

### error

- پیام خطا در بدنه جدول نمایش داده می‌شود.
- در صورت فعال بودن `error`، ردیف‌های قبلی نمایش داده نمی‌شوند.

### emptyMessage

هنگامی که `rows` خالی باشد و وضعیت‌های اولویت‌دار فعال نباشند، پیام خالی بودن اطلاعات نمایش داده می‌شود.

اولویت نمایش وضعیت‌ها:

1. `loading`
2. `error`
3. خالی بودن اطلاعات
4. ردیف‌های جدول

برای تلاش مجدد، والد باید دکمه موردنظر را ایجاد و درخواست API را مجدداً اجرا کند. DataTable مسئول دریافت اطلاعات یا اجرای مجدد درخواست نیست.

---

## مدیریت عرض ستون‌ها

عرض ستون‌ها با توجه به فضای در دسترس و محدودیت‌های هر ستون محاسبه می‌شود.

### عرض پایه

- مقدار پیش‌فرض عرض ستون `150px` است.
- `minWidth` حداقل عرض مجاز را مشخص می‌کند.
- `maxWidth` حداکثر عرض مجاز را مشخص می‌کند.
- اگر عرض درخواستی خارج از محدوده مجاز باشد، مقدار آن به نزدیک‌ترین حد مجاز محدود می‌شود.

### توزیع فضای اضافه

اگر مجموع عرض پایه ستون‌ها کمتر از فضای در دسترس باشد، فضای اضافه به‌صورت متناسب بین ستون‌ها توزیع می‌شود.

در این فرآیند:

- ستون‌هایی که به `maxWidth` برسند از توزیع بیشتر کنار گذاشته می‌شوند.
- فضای باقی‌مانده بین سایر ستون‌ها مجدداً توزیع می‌شود.
- این رفتار همیشه فعال است و نیازی به تنظیم جداگانه ندارد.

### columnFit

نحوه رفتار جدول هنگام کمبود فضای افقی را مشخص می‌کند.

مقادیر مجاز:

#### scroll

مقدار پیش‌فرض.

```jsx
columnFit="scroll"
```

- عرض ستون‌ها حفظ می‌شود.
- در صورت کمبود فضا، اسکرول افقی ایجاد می‌شود.

#### shrink

```jsx
columnFit="shrink"
```

- عرض ستون‌ها به‌صورت متناسب کاهش می‌یابد.
- هیچ ستونی از `minWidth` خود کوچک‌تر نمی‌شود.
- اگر مجموع حداقل عرض ستون‌ها از فضای در دسترس بیشتر باشد، اسکرول افقی باقی می‌ماند.

### تنظیم واکنش‌گرا

```jsx
columnFit={{
    xs: "shrink",
    sm: "shrink",
    md: "scroll",
    lg: "scroll",
}}
```

Breakpointها از تنظیمات `theme.breakpoints` در Material UI استفاده می‌کنند. مقادیر پیش‌فرض Material UI:

| Breakpoint | حداقل عرض |
|---|---:|
| `xs` | 0px |
| `sm` | 600px |
| `md` | 900px |
| `lg` | 1200px |
| `xl` | 1536px |

اگر برای breakpoint فعال مقداری معتبر تعریف نشده باشد، آخرین مقدار معتبر در breakpointهای کوچک‌تر استفاده می‌شود. در صورت نبود مقدار معتبر قبلی، `scroll` استفاده می‌شود.

---

## نمایش سربرگ (showHeader)

نوع: `boolean`

مقدار پیش‌فرض: `true`

```jsx
<DataTable
    showHeader={false}
    columns={columns}
    rows={rows}
/>
```

با تنظیم `false`:

- فقط سربرگ جدول مخفی می‌شود.
- بدنه و عملیات ردیف‌ها همچنان نمایش داده می‌شوند.
- مرتب‌سازی از طریق عنوان ستون در دسترس نخواهد بود.

---

## نمونه مدیریت وضعیت در والد

در این مثال، وضعیت صفحه‌بندی، مرتب‌سازی و انتخاب ردیف در والد نگهداری می‌شود.

```jsx
import { useState } from "react";
import { DataTable } from '@hkianim/react-components';

function MachinesPage() {
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 20,
        total: 125,
    });

    const [sorting, setSorting] = useState([]);
    const [selectedRowId, setSelectedRowId] = useState(null);

    const columns = [
        {
            field: "machineName",
            caption: "نام ماشین‌آلات",
            minWidth: 180,
            sortable: true,
        },
        {
            field: "dailyIncome",
            caption: "درآمد روزانه",
            minWidth: 140,
            alignment: "end",
            format: "currency",
        },
    ];

    const rows = [
        {
            id: 1,
            machineName: "بیل مکانیکی کوماتسو",
            dailyIncome: 8500000,
        },
    ];

    return (
        <DataTable
            columns={columns}
            rows={rows}
            pagination={pagination}
            onPaginationChange={setPagination}
            sorting={sorting}
            onSortChange={setSorting}
            selectedRowId={selectedRowId}
            onRowSelect={(rowId) => {
                setSelectedRowId(rowId);
            }}
            onOperation={(key, row) => {
                console.log(key, row);
            }}
        />
    );
}
```

در برنامه واقعی، والد با استفاده از وضعیت‌های صفحه‌بندی، مرتب‌سازی و فیلترها، اطلاعات موردنیاز را از API دریافت می‌کند و نتیجه را از طریق `rows` و `pagination.total` به DataTable می‌دهد.

---

## نکات معماری

- DataTable نباید مستقیماً به API، Redux یا RTK Query وابسته باشد.
- تمام وضعیت‌های قابل کنترل در والد نگهداری می‌شوند.
- کامپوننت مسئول نمایش اطلاعات و اعلام رویدادها است.
- فیلترها خارج از DataTable و در کامپوننت صفحه پیاده‌سازی می‌شوند.
- تغییر فیلترها باید در والد باعث بازگشت صفحه به ۱ شود.
- دکمه Refresh و منطق دریافت مجدد اطلاعات متعلق به والد هستند.
- برای حفظ وضعیت هنگام بازگشت از صفحات جزئیات، والد باید وضعیت صفحه‌بندی، مرتب‌سازی و انتخاب را نگهداری کند.
- ساختار جدول در موبایل و دسکتاپ یکسان است و در صورت نیاز از اسکرول افقی استفاده می‌شود.
- مخفی کردن ستون جایگزین کنترل دسترسی نیست؛ اطلاعات حساس نباید از سمت سرور ارسال شوند.

## محدودیت‌های نسخه فعلی

- انتخاب ردیف فقط تک‌ردیفی است.
- مرتب‌سازی در رابط کاربری تک‌ستونی است.
- فیلدهای تو در تو پشتیبانی نمی‌شوند.
- فیلتر داخلی وجود ندارد.
- مدیریت نمایش و ترتیب ستون‌ها توسط کاربر وجود ندارد.
- دریافت اطلاعات و صفحه‌بندی سمت سرور در والد مدیریت می‌شوند.
- تغییر اندازه دستی ستون‌ها توسط کاربر پشتیبانی نمی‌شود.
