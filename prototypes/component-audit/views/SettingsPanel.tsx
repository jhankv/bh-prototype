import { useState } from 'react'
import { useDS } from '@/ds'
import { useCopy } from '@/copy'

/**
 * A notification settings page, modelled on Mercury's — with the inline format
 * selector from Linear's and the explained disabled row from Dribbble's.
 *
 * Modelled on a real screen rather than invented, because the shape of real
 * settings content is what breaks these components. Mercury's list mixes rows
 * that carry a description with rows that do not, inside the same group. That
 * asymmetry is not decoration: it is the case where a control that aligns to
 * the centre of its row and a control that aligns to the first line of its
 * label stop agreeing with each other, and it is very hard to imagine into a
 * prototype you are inventing from scratch.
 *
 * Every "choose one thing" control in Banhaten ends up in one column here —
 * `Toggle`, `Checkbox`, `CheckboxCard`, `SegmentedControl`, `ButtonGroup`,
 * `Select`. Each looks perfectly consistent with itself in isolation. A
 * disagreement between two of them exists only in the space between them, so it
 * can only be seen when they share a left edge.
 *
 * Deliberately left at their defaults: `controlPosition`, and every `size`. A
 * prototype that passes every prop explicitly tests the props. This one tests
 * what a team gets when it does the ordinary thing and accepts what the
 * component offers.
 *
 * Nothing here is a component Banhaten does not ship. The sub-navigation and
 * the section rules are plain markup, and they are plain markup precisely
 * because there is no Banhaten component for them — inventing one would test
 * our invention instead of their design system.
 */

const COPY = {
  title: { en: 'Notifications', ar: 'الإشعارات' },
  sentTo: { en: 'All notifications are sent to', ar: 'تُرسل كل الإشعارات إلى' },
  address: { en: 'operations@northwind.example.com', ar: 'operations@northwind.example.com' },

  scopeLabel: { en: 'Settings scope', ar: 'نطاق الإعدادات' },
  scopes: { en: ['Personal', 'Team', 'Workspace'], ar: ['شخصي', 'الفريق', 'مساحة العمل'] },

  navOrders: { en: 'Order alerts', ar: 'تنبيهات الطلبات' },
  navPayments: { en: 'Payment activity', ar: 'نشاط المدفوعات' },
  navInventory: { en: 'Inventory', ar: 'المخزون' },
  navReimbursements: { en: 'Reimbursements', ar: 'المستردات' },

  groupOrders: { en: 'Order alerts', ar: 'تنبيهات الطلبات' },
  orderPlaced: { en: 'An order is placed', ar: 'تم إنشاء طلب' },
  orderFailed: { en: 'An order fails to process', ar: 'فشل معالجة طلب' },
  orderRefunded: { en: 'An order is refunded', ar: 'تم استرداد مبلغ طلب' },

  groupPolicy: { en: 'Spend policy', ar: 'سياسة الإنفاق' },
  policyReview: {
    en: 'Transaction requires additional information',
    ar: 'تتطلب المعاملة معلومات إضافية',
  },
  policyReviewNote: {
    en: 'Sent if a spend policy requires you to add information for a transaction (e.g. a receipt or note).',
    ar: 'يُرسل إذا كانت سياسة الإنفاق تتطلب إضافة معلومات للمعاملة، مثل إيصال أو ملاحظة.',
  },
  policyWeekly: { en: 'Weekly reminder', ar: 'تذكير أسبوعي' },
  policyWeeklyNote: {
    en: 'Sent at the end of the week to remind you about transactions that still require additional information.',
    ar: 'يُرسل في نهاية الأسبوع لتذكيرك بالمعاملات التي ما زالت تتطلب معلومات إضافية.',
  },
  policyChargeback: { en: 'Chargeback opened against a payment', ar: 'فُتح نزاع على دفعة' },
  policyChargebackNote: {
    en: 'Always on — a chargeback carries a response deadline you cannot miss.',
    ar: 'مفعّل دائمًا — للنزاع موعد نهائي للرد لا يمكن تفويته.',
  },

  groupDelivery: { en: 'Delivery channels', ar: 'قنوات الإرسال' },
  email: { en: 'Email', ar: 'البريد الإلكتروني' },
  emailNote: { en: 'Sent immediately', ar: 'يُرسل فورًا' },
  push: { en: 'Push', ar: 'الإشعارات الفورية' },
  pushNote: { en: '2 devices registered', ar: 'جهازان مسجلان' },
  sms: { en: 'SMS', ar: 'الرسائل النصية' },
  smsNote: { en: 'Not on your plan', ar: 'غير متاح في خطتك' },
  smsWhy: {
    en: 'SMS delivery is available on Scale and above. Contact your workspace owner to upgrade.',
    ar: 'إرسال الرسائل النصية متاح في خطة Scale وما فوق. تواصل مع مالك مساحة العمل للترقية.',
  },

  formatLabel: { en: 'Notification format', ar: 'صيغة الإشعار' },
  formatHelper: {
    en: 'Choose whether to group email notifications.',
    ar: 'اختر ما إذا كنت تريد تجميع إشعارات البريد.',
  },
  formatDigest: { en: 'Digest', ar: 'ملخص' },
  formatIndividual: { en: 'Individual', ar: 'فردي' },
  formatOff: { en: 'Off', ar: 'إيقاف' },

  groupDigest: { en: 'Weekly digest', ar: 'الملخص الأسبوعي' },
  digestNote: {
    en: 'Sent Mondays at 09:00 in your workspace timezone.',
    ar: 'يُرسل الاثنين الساعة ٩:٠٠ بتوقيت مساحة عملك.',
  },
  allSections: { en: 'All sections', ar: 'كل الأقسام' },
  revenue: { en: 'Revenue', ar: 'الإيرادات' },
  fulfillment: { en: 'Fulfillment', ar: 'التنفيذ' },
  returns: { en: 'Returns', ar: 'المرتجعات' },
  team: { en: 'Team activity', ar: 'نشاط الفريق' },
  density: { en: 'Digest density', ar: 'كثافة الملخص' },
  densities: { en: ['Brief', 'Standard', 'Full'], ar: ['موجز', 'قياسي', 'كامل'] },

  discard: { en: 'Discard', ar: 'تجاهل' },
  save: { en: 'Save changes', ar: 'حفظ التغييرات' },
} as const

const SECTIONS = ['revenue', 'fulfillment', 'returns', 'team'] as const

export default function SettingsPanel() {
  const {
    Badge,
    Button,
    ButtonGroup,
    ButtonGroupItem,
    Checkbox,
    CheckboxCard,
    SegmentedControl,
    SegmentedControlItem,
    Select,
    SelectMenuItem,
    Toggle,
    ToggleField,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } = useDS()
  const c = useCopy(COPY)

  const [scope, setScope] = useState('personal')
  const [density, setDensity] = useState('standard')
  const [format, setFormat] = useState('digest')
  const [channels, setChannels] = useState({ email: true, push: false })
  // Seeded partially checked, so the parent lands on `indeterminate` rather than
  // on either clean state — the case a settings page always reaches and a
  // gallery of Checkbox rarely bothers to show.
  const [sections, setSections] = useState<Record<string, boolean>>({
    revenue: true,
    fulfillment: true,
    returns: false,
    team: false,
  })

  const chosen = SECTIONS.filter((name) => sections[name]).length
  const all = chosen === SECTIONS.length
  const some = chosen > 0 && !all

  const formatLabel =
    format === 'digest' ? c.formatDigest : format === 'individual' ? c.formatIndividual : c.formatOff

  return (
    <TooltipProvider>
      <main className="min-h-dvh bg-[var(--background)] text-[var(--foreground)]">
        <div className="mx-auto max-w-[980px] px-10 py-10">
          <header className="mb-8">
            <h1 className="text-xl font-semibold">{c.title}</h1>
            <p className="mt-1.5 text-sm text-[var(--bh-content-subtle)]">
              {c.sentTo} <span dir="ltr">{c.address}</span>
            </p>
            <div className="mt-5">
              <SegmentedControl
                aria-label={c.scopeLabel}
                value={scope}
                onValueChange={(value: string) => setScope(value)}
              >
                {c.scopes.map((label, index) => (
                  <SegmentedControlItem
                    key={label}
                    value={['personal', 'team', 'workspace'][index]}
                  >
                    {label}
                  </SegmentedControlItem>
                ))}
              </SegmentedControl>
            </div>
          </header>

          <div className="grid grid-cols-[200px_1fr] gap-10">
            {/* Plain markup: Banhaten ships no navigation list, and inventing one
                would put our component under test instead of theirs. */}
            <nav className="flex flex-col gap-0.5 text-sm">
              {[
                { label: c.navOrders, count: null, current: true },
                { label: c.navPayments, count: 14, current: false },
                { label: c.navInventory, count: 3, current: false },
                { label: c.navReimbursements, count: 4, current: false },
              ].map((item) => (
                <span
                  key={String(item.label)}
                  className={`flex items-center justify-between gap-2 rounded-[var(--bh-radius-md)] px-2.5 py-1.5 ${
                    item.current ? 'font-medium' : 'text-[var(--bh-content-subtle)]'
                  }`}
                >
                  <span className="min-w-0 truncate">{item.label}</span>
                  {item.count !== null && <Badge color="neutral">{item.count}</Badge>}
                </span>
              ))}
            </nav>

            <div className="min-w-0">
              <Group title={c.groupOrders}>
                {/* Mercury's own pattern: three rows with no description at all,
                    directly above a group where every row has one. */}
                <Row label={c.orderPlaced}>
                  <Toggle defaultChecked aria-label={String(c.orderPlaced)} />
                </Row>
                <Row label={c.orderFailed}>
                  <Toggle defaultChecked aria-label={String(c.orderFailed)} />
                </Row>
                <Row label={c.orderRefunded}>
                  <Toggle aria-label={String(c.orderRefunded)} />
                </Row>
              </Group>

              <Group title={c.groupPolicy}>
                <ToggleField label={c.policyReview} description={c.policyReviewNote} defaultChecked />
                <ToggleField label={c.policyWeekly} description={c.policyWeeklyNote} defaultChecked />
                <ToggleField
                  label={c.policyChargeback}
                  description={c.policyChargebackNote}
                  defaultChecked
                  disabled
                />
              </Group>

              <Group title={c.groupDelivery}>
                <div className="grid gap-3 sm:grid-cols-3">
                  <CheckboxCard
                    label={c.email}
                    description={c.emailNote}
                    checked={channels.email}
                    onCheckedChange={(next: boolean) =>
                      setChannels((s) => ({ ...s, email: next }))
                    }
                  />
                  <CheckboxCard
                    label={c.push}
                    description={c.pushNote}
                    checked={channels.push}
                    onCheckedChange={(next: boolean) => setChannels((s) => ({ ...s, push: next }))}
                  />
                  {/* Dribbble's disabled row, which explains itself instead of
                      going quiet. The tooltip has to reach a disabled control —
                      the case where a trigger stops emitting pointer events. */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="block">
                        <CheckboxCard label={c.sms} description={c.smsNote} disabled />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent size="lg" supportText={c.smsWhy}>
                      {c.smsNote}
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Linear's inline format selector: a Select living inside a
                    settings row rather than in a form. */}
                <div className="mt-5 max-w-[280px]">
                  <Select
                    label={c.formatLabel}
                    helperText={c.formatHelper}
                    hasHelperText
                    selectValue={format}
                    value={formatLabel}
                    onValueChange={(next: string) => setFormat(next)}
                  >
                    <SelectMenuItem value="digest" label={c.formatDigest} />
                    <SelectMenuItem value="individual" label={c.formatIndividual} />
                    <SelectMenuItem value="off" label={c.formatOff} />
                  </Select>
                </div>
              </Group>

              <Group title={c.groupDigest} note={c.digestNote}>
                <div className="grid gap-2.5">
                  <label className="flex items-center gap-2.5 text-sm font-medium">
                    <Checkbox
                      checked={some ? 'indeterminate' : all}
                      onCheckedChange={(next: boolean) =>
                        setSections(
                          Object.fromEntries(SECTIONS.map((name) => [name, next === true])),
                        )
                      }
                    />
                    {c.allSections}
                  </label>
                  <div className="grid gap-2.5 ps-6">
                    {SECTIONS.map((name) => (
                      <label key={name} className="flex items-center gap-2.5 text-sm">
                        <Checkbox
                          checked={sections[name]}
                          onCheckedChange={(next: boolean) =>
                            setSections((s) => ({ ...s, [name]: next === true }))
                          }
                        />
                        {c[name]}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <span className="mb-1.5 block text-xs font-medium text-[var(--bh-content-subtle)]">
                    {c.density}
                  </span>
                  <ButtonGroup aria-label={c.density}>
                    {c.densities.map((label, index) => {
                      const value = ['brief', 'standard', 'full'][index]
                      return (
                        <ButtonGroupItem
                          key={label}
                          aria-pressed={density === value}
                          onClick={() => setDensity(value)}
                        >
                          {label}
                        </ButtonGroupItem>
                      )
                    })}
                  </ButtonGroup>
                </div>
              </Group>

              <footer className="flex items-center justify-end gap-2 pt-6">
                <Button variant="secondary">{c.discard}</Button>
                <Button>{c.save}</Button>
              </footer>
            </div>
          </div>
        </div>
      </main>
    </TooltipProvider>
  )
}

function Group({
  title,
  note,
  children,
}: {
  title: string
  note?: string
  children: React.ReactNode
}) {
  return (
    <section className="border-b border-[var(--bh-border-default)] pb-7 [&:not(:first-child)]:pt-7">
      <h2 className="text-xs font-semibold tracking-wide text-[var(--bh-content-subtle)] uppercase">
        {title}
      </h2>
      {note && <p className="mt-1 text-xs text-[var(--bh-content-subtle)]">{note}</p>}
      <div className="mt-4 grid gap-4">{children}</div>
    </section>
  )
}

/**
 * A settings row with no description — the shape a `ToggleField` cannot take,
 * since `label` is required and a description-less field still reserves the
 * space for one.
 *
 * The control goes first, matching `ToggleField`'s own `controlPosition`
 * default of `"start"`. That alignment is deliberate and it is not a style
 * choice: these rows sit directly above a group of real `ToggleField`s, so if
 * this markup put its toggle on the opposite edge, the first inconsistency a
 * reviewer saw would be ours. A convincing false finding is the worst thing
 * this playground can produce.
 */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      {children}
      <span className="min-w-0 text-sm">{label}</span>
    </div>
  )
}
