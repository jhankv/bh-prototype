import { Plus, Trash2 } from 'lucide-react'
import { useDS } from '@/ds'
import { Gallery, Group, Item } from '../gallery'

const VARIANTS = [
  'default',
  'secondary',
  'outline',
  'soft',
  'ghost',
  'ghost-primary',
  'link',
  'danger',
  'destructive',
  'soft-danger',
  'soft-destructive',
  'success',
  'warning',
  'white',
] as const

const SIZES = ['xs', 'sm', 'default', 'lg', 'xl'] as const
const ICON_SIZES = ['icon-xs', 'icon-sm', 'icon', 'icon-lg', 'icon-xl'] as const
const DENSITIES = ['compact', 'default', 'comfortable'] as const

export default function Buttons() {
  const { Button } = useDS()

  return (
    <Gallery
      title="Button"
      subtitle="14 variants · 5 sizes · 5 icon sizes · 3 densities · states"
    >
      <Group
        label="Variants"
        note="`white` sits on a tinted strip — on a light surface it is invisible against the page, which is worth knowing before reaching for it."
      >
        {VARIANTS.filter((v) => v !== 'white').map((variant) => (
          <Item key={variant} label={variant}>
            <Button variant={variant}>Place order</Button>
          </Item>
        ))}
      </Group>

      <Group label="Variant · white">
        <div className="rounded-lg bg-[var(--bh-bg-inverse,#1c1c1c)] p-4">
          <Item label="white">
            <Button variant="white">Place order</Button>
          </Item>
        </div>
      </Group>

      <Group label="Sizes" note="Baselines should align across the row.">
        {SIZES.map((size) => (
          <Item key={size} label={size}>
            <Button size={size}>Place order</Button>
          </Item>
        ))}
      </Group>

      <Group label="Density" note="Same size, different control density.">
        {DENSITIES.map((density) => (
          <Item key={density} label={density}>
            <Button density={density}>Place order</Button>
          </Item>
        ))}
      </Group>

      <Group label="With icons" note="Leading and trailing icons, and icon-only sizes.">
        <Item label="leading">
          <Button>
            <Plus data-icon="inline-start" />
            New order
          </Button>
        </Item>
        <Item label="trailing">
          <Button variant="secondary">
            Delete
            <Trash2 data-icon="inline-end" />
          </Button>
        </Item>
        {ICON_SIZES.map((size) => (
          <Item key={size} label={size}>
            <Button size={size} aria-label="Add">
              <Plus />
            </Button>
          </Item>
        ))}
      </Group>

      <Group label="States">
        <Item label="default">
          <Button>Place order</Button>
        </Item>
        <Item label="disabled">
          <Button disabled>Place order</Button>
        </Item>
        <Item label="aria-invalid">
          <Button aria-invalid>Place order</Button>
        </Item>
        <Item label="disabled · secondary">
          <Button variant="secondary" disabled>
            Place order
          </Button>
        </Item>
        <Item label="disabled · outline">
          <Button variant="outline" disabled>
            Place order
          </Button>
        </Item>
        <Item label="disabled · danger">
          <Button variant="danger" disabled>
            Place order
          </Button>
        </Item>
      </Group>

      <Group
        label="Content stress"
        note="Long labels, bilingual text, and a single character. Buttons break at their extremes, not their averages."
      >
        <Item label="long">
          <Button>Confirm and place this order for immediate fulfilment</Button>
        </Item>
        <Item label="arabic">
          <Button variant="secondary">تأكيد الطلب وإرساله للتنفيذ الفوري</Button>
        </Item>
        <Item label="single char">
          <Button>1</Button>
        </Item>
      </Group>
    </Gallery>
  )
}
