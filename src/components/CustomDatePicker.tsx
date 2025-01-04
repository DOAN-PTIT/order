import { DatePicker } from 'antd';
import type { Moment } from 'moment';
import momentGenerateConfig from 'rc-picker/lib/generate/moment';

const CustomDatePicker = DatePicker.generatePicker<Moment>(momentGenerateConfig);

export default CustomDatePicker;