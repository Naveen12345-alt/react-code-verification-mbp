import * as React from 'react'
import {Container, Input, Item} from './styled'

const KEY_CODE = {
  BACKSPACE: 8,
  ARROW_LEFT: 37,
  ARROW_RIGHT: 39,
  DELETE: 46,
}

const ReactInputVerificationCode = ({
  length = 4,
  onChange,
  onCompleted,
  placeholder = '',
  pValue,
}) => {
  const emptyValue = new Array(length).fill(placeholder)

  const [activeIndex, setActiveIndex] = React.useState(0)
  const [value, setValue] = React.useState(emptyValue)

  const codeInputRef = React.createRef()

  const itemsRef = React.useMemo(
    () => new Array(length).fill(null).map(() => React.createRef()),
    [length],
  )

  const isCodeRegex = new RegExp(`^[0-9]{${length}}$`)

  const getItem = index => itemsRef[index]?.current
  const focusItem = index => getItem(index)?.focus()
  const blurItem = index => getItem(index)?.blur()

  const onItemFocus = index => () => {
    setActiveIndex(index)
    if (codeInputRef.current) codeInputRef.current.focus()
  }

  const onInputKeyUp = ({key, keyCode}) => {
    const newValue = [...value]
    const nextIndex = activeIndex + 1
    const prevIndex = activeIndex - 1
    const codeInput = codeInputRef.current
    const currentItem = getItem(activeIndex)

    const isLast = nextIndex === length
    const isDeleting =
      keyCode === KEY_CODE.DELETE || keyCode === KEY_CODE.BACKSPACE

    // keep items focus in sync
    onItemFocus(activeIndex)

    // on delete, replace the current value
    // and focus on the previous item
    if (isDeleting) {
      newValue[activeIndex] = placeholder
      setValue(newValue)

      if (activeIndex > 0) {
        setActiveIndex(prevIndex)
        focusItem(prevIndex)
      }

      return
    }

    // if the key pressed is not a number
    // don't do anything
    if (Number.isNaN(+key)) return

    // reset the current value
    // and set the new one
    if (codeInput) codeInput.value = ''
    if (newValue[activeIndex] !== placeholder) return

    newValue[activeIndex] = key
    setValue(newValue)

    if (!isLast) {
      setActiveIndex(nextIndex)
      focusItem(nextIndex)
      return
    }

    // if (codeInput) codeInput.blur()
    if (currentItem) currentItem.blur()

    setActiveIndex(activeIndex)
  }

  // handle mobile autocompletion
  const onInputChange = e => {
    const {value: changeValue} = e.target
    const isCode = isCodeRegex.test(changeValue)

    if (!isCode) {
      return
    }

    setValue(changeValue.split(''))
    blurItem(activeIndex)
  }

  const onInputBlur = () => {
    // https://github.com/ugogo/react-input-verification-code/issues/1
    if (activeIndex === -1) return

    blurItem(activeIndex)
    setActiveIndex(-1)
  }

  // handle pasting
  React.useEffect(() => {
    const codeInput = codeInputRef.current
    if (!codeInput) return

    const onPaste = e => {
      e.preventDefault()

      const pastedString = e.clipboardData?.getData('text')
      if (!pastedString) return

      const isNumber = !Number.isNaN(+pastedString)
      if (isNumber) setValue(pastedString.split(''))
    }

    codeInput.addEventListener('paste', onPaste)
    return () => codeInput.removeEventListener('paste', onPaste)
  }, [codeInputRef])

  React.useEffect(() => {
    const stringValue = value.join('')
    const isCompleted = !stringValue.includes(placeholder)

    if (isCompleted) onCompleted(stringValue)
    onChange(stringValue)
  }, [onChange, onCompleted, placeholder, value])

  React.useEffect(() => {
    if (typeof pValue !== 'string') return

    // avoid infinite loop
    if (pValue === '' && value.join('') === emptyValue.join('')) return

    // keep internal and external states in sync
    if (pValue !== value.join('')) setValue(pValue.split(''))
  }, [emptyValue, pValue, value])

  return (
    <React.Fragment>
      <Container
        className="ReactInputVerificationCode__container"
        // needed for styling
        itemsCount={length}
      >
        <Input
          ref={codeInputRef}
          className="ReactInputVerificationCode__input"
          autoComplete="one-time-code"
          type="text"
          inputMode="decimal"
          id="one-time-code"
          autoFocus
          // use onKeyUp rather than onChange for a better control
          // onChange is still needed to handle the autocompletion
          // when receiving a code by SMS
          onChange={onInputChange}
          onKeyUp={onInputKeyUp}
          onBlur={onInputBlur}
          // needed for styling
          activeIndex={activeIndex}
        />

        {itemsRef.map((ref, i) => (
          <Item
            key={i}
            ref={ref}
            role="button"
            tabIndex={0}
            className={`ReactInputVerificationCode__item ${
              i === activeIndex ? 'is-active' : ''
            }`}
            onFocus={onItemFocus(i)}
          >
            {value[i] || placeholder}
          </Item>
        ))}
      </Container>
    </React.Fragment>
  )
}

export default ReactInputVerificationCode
