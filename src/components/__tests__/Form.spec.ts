import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import Form from '../Form.vue'

describe('Form', () => {
  it('renders properly', () => {
    const wrapper = mount(Form, {
      props: {
        defaultModel: {
          cols: 60,
          rows: 150,
          colSize: 36,
          rowSize: 38
        },
        isLoading: false,
        onModelChange: () => {}
      }
    });
    expect(wrapper.find('button').exists()).toBe(true)
  })
})
