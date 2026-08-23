import { Search } from 'lucide-react'
import { useDS } from '@/ds'
import { Gallery, Group, Item } from '../gallery'

const SIZES = ['md', 'lg', 'comfortable'] as const
const VARIANTS = ['default', 'soft'] as const
const STATES = ['default', 'filled', 'error', 'disabled'] as const

export default function Inputs() {
  const { Input } = useDS()

  return (
    <Gallery
      title="Input"
      subtitle="2 variants · 3 sizes · 4 states · labels, helpers, icons, and affixes"
    >
      <Group label="Variants">
        {VARIANTS.map((variant) => (
          <Item key={variant} label={variant}>
            <Input variant={variant} placeholder="Search orders" />
          </Item>
        ))}
      </Group>

      <Group label="Sizes" note="Height should come from a token, not a literal.">
        {SIZES.map((size) => (
          <Item key={size} label={size}>
            <Input size={size} placeholder="Search orders" />
          </Item>
        ))}
      </Group>

      <Group label="States" note="Driven off the state union, so a new state cannot be missed here.">
        {STATES.map((state) => (
          <Item key={state} label={state}>
            <Input
              state={state}
              disabled={state === 'disabled'}
              defaultValue={state === 'filled' ? 'ORD-49001' : state === 'error' ? 'not-an-email' : undefined}
              errorMessage={state === 'error' ? 'Enter a valid email.' : undefined}
              placeholder="Search orders"
            />
          </Item>
        ))}
      </Group>

      <Group label="Label and helper text">
        <Item label="label">
          <Input label="Email" placeholder="you@example.com" />
        </Item>
        <Item label="isRequired">
          <Input label="Email" isRequired placeholder="you@example.com" />
        </Item>
        <Item label="isOptional">
          <Input label="Company" isOptional placeholder="Acme Inc." />
        </Item>
        <Item label="isOptional + optionalText">
          <Input label="Company" isOptional optionalText="(optional)" placeholder="Acme Inc." />
        </Item>
        <Item label="message">
          <Input label="Email" message="We only use this for receipts." placeholder="you@example.com" />
        </Item>
        <Item label="showInfo">
          <Input label="VAT number" showInfo placeholder="XX000000000" />
        </Item>
      </Group>

      <Group label="Icons and affixes">
        <Item label="leadingIcon">
          <Input leadingIcon={<Search />} placeholder="Search orders" />
        </Item>
        <Item label="showAtSign">
          <Input showAtSign placeholder="username" />
        </Item>
        <Item label="trailingIcon">
          <Input trailingIcon={<Search />} placeholder="Search orders" />
        </Item>
        <Item label="both">
          <Input leadingIcon={<Search />} trailingIcon={<Search />} placeholder="Search orders" />
        </Item>
      </Group>

      <Group
        label="Content stress"
        note="Long values, bilingual text, and a value longer than the field. Truncation and direction are where inputs fail."
      >
        <Item label="long value">
          <Input
            label="Recipient"
            defaultValue="maximiliano.alessandro.fernandez.delavega@enterprise-procurement.example.com"
          />
        </Item>
        <Item label="arabic value">
          <Input label="المستلم" defaultValue="عبد الرحمن بن محمد بن عبد الله آل سعود" />
        </Item>
        <Item label="arabic label · latin value">
          <Input label="البريد الإلكتروني" defaultValue="a.alshammari@example.com" />
        </Item>
      </Group>
    </Gallery>
  )
}
