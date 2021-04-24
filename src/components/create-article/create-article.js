import React, {useCallback, useEffect} from 'react';
import {connect} from "react-redux";
import PropTypes from 'prop-types';
import {useHistory} from 'react-router-dom';
import {useForm, useFieldArray, useController} from "react-hook-form";
import { Input } from 'antd';
import styles from './create-article.module.scss'
import {createArticleFailed, createNewArticle} from "../../redux/actions/create-article";
import {getUser} from "../../services/local-storage";
import validate from "./validate";
import openNotification from "../notification";

const CreateArticle = ({token, createArticle, isError}) => {

    console.log(isError)

    const {register, handleSubmit, control, formState: {errors}} = useForm({
        defaultValues: {
            tagList: ['']
        }
    });
    const { fields, append, remove } = useFieldArray({
            control,
            name: "tagList"
        }
    );
    const { field } = useController({name: 'body', control, rules:{...validate.validateBody}});


    const {createArticleWrapper,createArticleTitle, createField, createItem, createTitle, createInput, createTagWrapper, tagsField,
    deleteButton, addButton, createSubmit, submitButton, tagsFieldWrapper, errorMessage} = styles;


    const handlerSubmit = (data) => createArticle(data, token);

    const history = useHistory();

    const initHistory = useCallback(() => {
        if(isError === false) {
            history.push('/');
        }
        if(isError === true) {
            openNotification('error', 'Error', 'Invalid');
        }
    }, [history, isError]);

    useEffect(() => {
        initHistory();
    },[initHistory])


    const tagList = fields.map((tag, index)=> {
        const lastTag = fields.indexOf(fields[fields.length - 1]);
        return (
            <div className={tagsField} key={tag.id}>
                <input className={createInput} type='text' placeholder='Tag' {...register(`tagList[${index}]` )} defaultValue=''/>
                {errors.index}
                <button type='button' className={deleteButton} onClick={() => remove(index)}>Delete</button>
                {lastTag === index ? <button type='button' className={addButton} onClick={() => append({name: ''})}>Add tag</button> : ''}
            </div>
        )
    })
    const {TextArea} = Input;
   
    return (
        <div className={createArticleWrapper}>
            <span className={createArticleTitle}>Create new article</span>
            <div className={createField}>
                <label className={createItem}>
                    <span className={createTitle}>Title</span>
                    <input className={createInput} type='text' placeholder='Title' {...register('title', {...validate.validateTitle})}/>
                    {errors.title && <p className={errorMessage}>{errors.title.message}</p>}
                </label>
                <label className={createItem}>
                    <span className={createTitle}>Short description</span>
                    <input className={createInput} type='text' placeholder='Description'{...register('description',{...validate.validateDescription})}/>
                    {errors.description && <p>{errors.description.message}</p>}
                </label>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className={createItem}>
                    <span className={createTitle}>Text</span>
                    <TextArea autoSize={{ minRows: 3, maxRows: 5 }} {...field}/>
                    {errors.body && <p className={errorMessage}>{errors.body.message}</p>}
                </label>
            </div>
            <div className={createTagWrapper}>
                <span className={createTitle}>Tags</span>
                <div className={tagsFieldWrapper}>
                    {tagList}
                </div>

            </div>
            <div className={createSubmit}>
                <button type='button' className={submitButton} onClick={handleSubmit(handlerSubmit)}>Send</button>
            </div>
        </div>
    )
}
CreateArticle.defaultProps = {
    createArticle: ()=>{},
    updateError: () =>{},
    token: '',
    isError: false
}
CreateArticle.propTypes = {
    createArticle: PropTypes.func,
    updateError: PropTypes.func,
    token: PropTypes.string,
    isError: PropTypes.bool
}
const mapStateToProps = (state) => {
    const user = getUser();
    const isError = state.createArticleReducer.createArticleFailed
   const {token} = user;
   return {token, isError};
}
const mapDispatchToProps = (dispatch) => ({
    createArticle: (data, token) => dispatch(createNewArticle(data, token)),
    updateError: (isError) => dispatch(createArticleFailed(isError))
})

export default connect(mapStateToProps, mapDispatchToProps)(CreateArticle);