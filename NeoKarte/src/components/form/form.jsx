import './form.css';

function Form({labelName, labelContent}){
    <div className='formMain'>
        <form className='formForm' method='POST'>
            <label for={labelName} className='formLabel'>{labelContent}</label>
            <input type={inputType} name={labelName} className='formInput'/>
        </form>
    </div>
}

export default Form;