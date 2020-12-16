import React,{Component} from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  Alert} from 'react-native';
import db from '../config';
import firebase from 'firebase';
import MyHeader from '../components/MyHeader';
import {BookSearch} from 'react-native-google-books';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { ListItem } from 'react-native-elements';

export default class BookRequestScreen extends Component{
  constructor(){
    super();
    this.state ={
      userId : firebase.auth().currentUser.email,
      bookName:"",
      reasonToRequest:"",
      IsBookRequestActive : "",
      requestedBookName: "",
      bookStatus:"",
      requestId:"",
      userDocId: '',
      docId :'',
      Imagelink: '',
      dataSource:"",
      showFlatlist: false
    }
  }

  createUniqueId(){
    return Math.random().toString(36).substring(7);
  }

  getIsBookRequestActive(){
    db.collection('users')
    .where('email_id','==',this.state.userId)
    .onSnapshot(querySnapshot => {
      querySnapshot.forEach(doc => {
        this.setState({
          IsBookRequestActive:doc.data().IsBookRequestActive,
          userDocId : doc.id
        })
      })
    })
  }                                                                                                                                                                                                                                                     

  getBookRequest =()=>{
    // getting the requested book
  var bookRequest=  db.collection('requested_books')
    .where('user_id','==',this.state.userId)
    .get()
    .then((snapshot)=>{
      snapshot.forEach((doc)=>{
        if(doc.data().book_status !== "received"){
          this.setState({
            requestId : doc.data().request_id,
            requestedBookName: doc.data().book_name,
            bookStatus:doc.data().book_status,
            docId     : doc.id
          })
        }
      })
  })}

  addRequest = async (bookName,reasonToRequest)=>{
    var userId = this.state.userId
    var randomRequestId = this.createUniqueId()
    var books = await BookSearch.searchbook(bookName, "AIzaSyDj44BZDWdvJ5raFiAjsNdea4yLA6_GefE")

    db.collection('requested_books').add({
        "user_id": userId,
        "book_name": bookName,
        "reason_to_request": reasonToRequest,
        "request_id"  : randomRequestId,
        "book_status" : "requested",
        "date" : firebase.firestore.FieldValue.serverTimestamp(),
        "image_link" : books.data[0].volumeInfo.Imagelinks.smallThumbnail
    })

    await this.getBookRequest()
      db.collection("users").where("email_id", "==", userId).get()
      .then()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          db.collection("users").doc(doc.id).update({
            isBookRequestActive : true
          })
        })
      })

    this.setState({
        bookName :'',
        reasonToRequest : ''
    })

    return Alert.alert("Book Requested Successfully")
  }

  sendNotification=()=>{
    //to get the first name and last name
    db.collection('users').where('email_id','==',this.state.userId).get()
    .then((snapshot)=>{
      snapshot.forEach((doc)=>{
        var name = doc.data().first_name
        var lastName = doc.data().last_name
  
        // to get the donor id and book name
        db.collection('all_notifications').where('request_id','==',this.state.requestId).get()
        .then((snapshot)=>{
          snapshot.forEach((doc) => {
            var donorId  = doc.data().donor_id
            var bookName =  doc.data().book_name
  
            //targeted user id is the donor id to send notification to the user
            db.collection('all_notifications').add({
              "targeted_user_id" : donorId,
              "message" : name + " " + lastName + " received the book " + bookName ,
              "notification_status" : "unread",
              "book_name" : bookName
            })
          })
        })
      })
    })
  }
  
  componentDidMount(){
    this.getBookRequest()
    this.getIsBookRequestActive()
  
  }
  
  updateBookRequestStatus=()=>{
    //updating the book status after receiving the book
    db.collection('requested_books').doc(this.state.docId)
    .update({
      book_status : 'recieved'
    })
  
    //getting the  doc id to update the users doc
    db.collection('users').where('email_id','==',this.state.userId).get()
    .then((snapshot)=>{
      snapshot.forEach((doc) => {
        //updating the doc
        db.collection('users').doc(doc.id).update({
          IsBookRequestActive: false
        })
      })
    })
  
  
  }

  async getBooksFromApi(bookName){

   this.setState({
     bookName : bookName
   })

   if(bookName.length > 2){
     var books = await BookSearch.searchbook(bookName, "AIzaSyDj44BZDWdvJ5raFiAjsNdea4yLA6_GefE") 
     this.setState({
       dataSource : books.data,
       showFlatlist : true
     })
   }

  }

  renderItem = ({item, i }) => {
   return(
     <TouchableHighlight 
     style = {{alignItems : "center", backgroundColor : "blue", padding : 10, width : "90%" }}
     activeOpacity = {0.6}
     underlayColor = "#DDDDDD"
     onPress = {() => {
       this.setState({
        showFlatlist: false,
        bookName : item.volumeInfo.title
       })
     }}
     bottomDivider
     >

       <Text> {item.volumeInfo.title} </Text>
       
     </TouchableHighlight>
   )
  }

  render(){

    if(this.state.isBookRequestActive === true ){
     return(
       <View style = {{flex : 1, justifyContent : "center"}}>
        
        <View style = {{borderColor : "orange", borderWidth : 2, justifyContent : "center", alignItems : "center", padding : 10, margin : 10}}>

          <Text>
          BOOK NAME
          </Text>

          <Text>
          {this.state.requestedBookName}
          </Text>

        </View>

        <View style = {{borderColor : "orange", borderWidth : 2, justifyContent : "center", alignItems : "center", padding : 10, margin : 10}}>

          <Text>
          BOOK STATUS
          </Text>

          <Text>
          {this.state.bookStatus}
          </Text>

        </View>  

        <TouchableOpacity style={{borderWidth:1,borderColor:'orange',backgroundColor:"orange",width:300,alignSelf:'center',alignItems:'center',height:30,marginTop:30}}
          onPress={()=>{
            this.sendNotification()
            this.updateBookRequestStatus();
            this.receivedBooks(this.state.requestedBookName)
          }}>
          <Text>I recieved the book </Text>
          
        </TouchableOpacity>


       </View>
     )
    }
  
  else{
    return(
      // Form screen
        <View style={{flex:1}}>
          <MyHeader title="Request Book" navigation ={this.props.navigation}/>

          <View>

          <TextInput
            style ={styles.formTextInput}
            placeholder={"enter book name"}
            onChangeText={text => this.getBooksFromApi(text)}
            onClear={text => this.getBooksFromApi('')}
            value={this.state.bookName}
          />

      {  this.state.showFlatlist ?

        (  <FlatList
        data={this.state.dataSource}
        renderItem={this.renderItem}
        enableEmptySections={true}
        style={{ marginTop: 10 }}
        keyExtractor={(item, index) => index.toString()}
      /> )
      :(
        <View style={{alignItems:'center'}}>
        <TextInput
          style ={[styles.formTextInput,{height:300}]}
          multiline
          numberOfLines ={8}
          placeholder={"Why do you need the book"}
          onChangeText ={(text)=>{
              this.setState({
                  reasonToRequest:text
              })
          }}
          value ={this.state.reasonToRequest}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={()=>{ this.addRequest(this.state.bookName,this.state.reasonToRequest);
          }}
          >
          <Text>Request</Text>
        </TouchableOpacity>
        </View>
      )
    }
            </View>
        </View>
    )
  }
}
}

const styles = StyleSheet.create({
  keyBoardStyle : {
    flex:1,
    alignItems:'center',
    justifyContent:'center'
  },
  formTextInput:{
    width:"75%",
    height:35,
    alignSelf:'center',
    borderColor:'#ffab91',
    borderRadius:10,
    borderWidth:1,
    marginTop:20,
    padding:10,
  },
  button:{
    width:"75%",
    height:50,
    justifyContent:'center',
    alignItems:'center',
    borderRadius:10,
    backgroundColor:"#ff5722",
    shadowColor: "#000",
    shadowOffset: {
       width: 0,
       height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
    marginTop:20
    },
  }
)
