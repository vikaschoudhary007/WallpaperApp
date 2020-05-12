import React, { Component } from 'react';
import { View, ActivityIndicator,FlatList, Dimensions, Animated,TouchableWithoutFeedback, TouchableOpacity, Share } from 'react-native';
import Axios from 'axios';
import {Ionicons} from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Permissions from 'expo-permissions';
import CameraRoll from "@react-native-community/cameraroll";

const {height, width} = Dimensions.get('window')
class App extends Component {

  constructor(){
    super()

    this.state = {
      isLoading : true,
      images:[],
      scale : new Animated.Value(1),
      isImageFocused:false
    };

    this.scale = {
      transform :[{scale: this.state.scale}]
    }

    this.actionBarY = this.state.scale.interpolate({
      inputRange:[0.9,1],
      outputRange:[0,-80]
    })

    this.borderRadius = this.state.scale.interpolate({
      inputRange:[0.9,1],
      outputRange:[30,0]
    })

  }

  loadWallpapers = () => {

    Axios.get("https://api.unsplash.com/photos/random?count=30&client_id=aRxB0dUdMv7-Is-W1rWuBmbKgtHD3Qc8Tx_FTK94nRc").then(function(response){
      console.log(response.data)
      this.setState({images:response.data, isLoading:false})
    }.bind(this))
    .catch(function(err){
      console.log(err)
    })
    .finally(function(){
      console.log("request completed")
    })

  }

  showControls = (item) => {

    this.setState((state) => ({
      isImageFocused : !state.isImageFocused
    }),()=> {
      if(this.state.isImageFocused)
      {
         Animated.spring(this.state.scale, {
           toValue:0.9
         }).start() 
      }
      else{
        Animated.spring(this.state.scale, {
          toValue:1
        }).start()
      }
    })
  }

  saveToCameraRoll = async image => {
    const cameraPermissions = await Permissions.getAsync(Permissions.CAMERA_ROLL)

    if(cameraPermissions.status !== 'granted'){
      cameraPermissions = await Permissions.askAsync(Permissions.CAMERA_ROLL)
    }

    if(cameraPermissions.status === 'granted'){
      FileSystem.downloadAsync(
        image.urls.regular,
        FileSystem.documentDirectory + image.id + '.jpg'
        ).then(({ uri }) => {
          CameraRoll.saveToCameraRoll(uri, "photo")
          alert("Saved to photos")
        }).catch(err => {
          console.log(err)
        })
    }
    else{
      alert('Permission required to save image')
    }
  }
  

  shareWallpaper = async image => {
    try{
      await Share.share({
        message: "Checkout this wallpaper " + image.urls.full
      });
    }catch(error){
      console.log(error)
    }
  };


  componentDidMount() {
    this.loadWallpapers()
  }

  renderItem = ({ item }) => {
    return(
      <View style={{flex:1}}>
        <View style={{
          position:"absolute",
          left:0,
          right:0,
          top:0,
          bottom:0,
          backgroundColor:'black',
          alignItems:"center",
          justifyContent:"center"
        }}>
          <ActivityIndicator size="large" color="grey"/>
        </View>
        <TouchableWithoutFeedback onPress={() => this.showControls(item)}>
          <Animated.View style={[{height,width}, this.scale]}>
            <Animated.Image 
              source = {{ uri: item.urls.regular}}
              style={{flex:1, height:null, width:null, borderRadius: this.borderRadius }} 
              resizeMode="cover"
            /> 
          </Animated.View>
        </TouchableWithoutFeedback>
        <Animated.View 
          style={{
            position:"absolute",
            left:0,
            right:0,
            bottom:this.actionBarY,
            height:80,
            backgroundColor:"black",
          }}
        >
          <View style={{flex:1, alignItems:"center",justifyContent:"space-around", flexDirection:"row"}}>
            <TouchableOpacity activeOpacity={0.5} onPress={() => this.loadWallpapers()}>
              <Ionicons name="ios-refresh" color="white" size={40}/>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.5} onPress={() => this.shareWallpaper(item)}>
              <Ionicons name="ios-share" color="white" size={40}/>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.5} onPress={() => this.saveToCameraRoll(item)}>
              <Ionicons name="ios-save" color="white" size={40}/>
            </TouchableOpacity>
          </View>

        </Animated.View>
        
      </View>
    )
  }

  render() {

    console.disableYellowBox = true;

    return this.state.isLoading? (
      <View style={{flex:1, backgroundColor:"black", alignItems:"center", justifyContent:"center"}}>
        <ActivityIndicator size="large" color="grey" />
      </View>
    ):(
      <View style={{flex:1, backgroundColor:"black"}}>
          <FlatList 
            scrollEnabled={!this.state.isImageFocused}
            horizontal
            pagingEnabled
            data={this.state.images}
            renderItem={this.renderItem}
            keyExtractor={(item) => item.id}
          />
      </View>
    )
  }
 
}

export default App;