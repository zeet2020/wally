import React, {Component, Fragment} from 'react';
import {debounce} from 'lodash-es';
import {ModernHeader} from '@freakycoder/react-native-header-view';
import {GorgeousHeader} from '@freakycoder/react-native-header-view';
import {
  SafeAreaView,
  Header,
  View,
  Vibration,
  Text,
  TextInput,
  ToastAndroid,
  Button,
  Image,
  ImageBackground,
  FlatList,
  Alert,
  StyleSheet,
  NativeModules,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';

import RNWalle from 'react-native-walle';

const API_KEY = '2394023940';
const URL = `https://pixabay.com/api/?key=${API_KEY}&safesearch=true&orientation=vertical&image_type=photo&pretty=tru`;

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function App() {
  let handleSearch = text => {
    const formattedQuery = text.toLowerCase();
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <List />
    </SafeAreaView>
  );
}

export function Item({image}) {
  console.log(image.previewURL);
  let setImage = () => {
    RNWalle.setWallPaper(image.webformatURL, () => {
      ToastAndroid.showWithGravity(
        'Image set as background.',
        ToastAndroid.SHORT,
        ToastAndroid.CENTER,
      );
    });
  };
  return (
    <TouchableOpacity onPress={setImage}>
      <ImageBackground
        style={{
          width: '100%',
          height: image.webformatHeight,
        }}
        source={{
          uri: image.webformatURL,
        }}>
        <Text style={styles.headline}>Tap on image to set as background.</Text>
      </ImageBackground>
    </TouchableOpacity>
  );
}

class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      images: [],
      original: [],
      searchTerm: null,
      searchHidden: true,
    };
    this.updateContext = state => {
      this.setState(state);
    };

    this.updateImageData = imgObj => {
      let list = this.state.images;
      for (let i = 0; i < list.lenght; i++) {
        if (imgObj.id === list[i].id) {
          list[i] = imgObj;
          break;
        }
      }
      this.updateContext({images: list});
    };

    this.handleScroll = e => {
      if (
        parseInt(this.state.original.total / 20) +
          (this.state.original.total % 20 !== 0 ? 1 : 0) >
        this.pageCount
      ) {
        this.pageNext();
      }
    };
  }

  componentDidMount() {
    this.updateData();
  }

  pageNext() {
    this.pageCount = this.pageCount + 1;

    ToastAndroid.showWithGravity(
      'Fetching results',
      ToastAndroid.SHORT,
      ToastAndroid.CENTER,
    );
    let term = this.state.searchTerm || 'nature';
    return this.getData(term).then(r => {
      r.json().then(
        data => {
          let images = this.state.images;

          for (let i = 0; i < data.hits.length; i++) {
            images.push(data.hits[i]);
          }
          this.updateContext({images: images});
        },
        e => {},
      );
    });
  }

  updateData(term) {
    if (api_key.length == 0) {
      //
    }
    this.pageCount = 1;
    ToastAndroid.showWithGravity(
      'Fetching results',
      ToastAndroid.SHORT,
      ToastAndroid.CENTER,
    );
    this.setState({searchTerm: term});
    return this.getData(term).then(r => {
      r.json().then(data => {
        if (data && data.hits && data.hits.length === 0) {
          ToastAndroid.showWithGravity(
            'No result found, try with different key word',
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          );
        }

        this.updateContext({images: data.hits, original: data});
      });
    });
  }

  getData(searchTerm = 'wild animals') {
    let url = URL + `&q=${searchTerm}`;

    if (this.pageCount) {
      url = url + `&page=${this.pageCount}`;
    }

    return fetch(url);
  }

  handleSearch = element => {
    const formattedQuery = element.nativeEvent.text.toLowerCase();
    if (formattedQuery && formattedQuery.length > 0) {
      this.updateData(formattedQuery);
      this.toggleSearch();
    }
  };

  renderHeader = () => {
    let searchHidden = this.state.searchHidden;
    return (
      !searchHidden && (
        <View
          style={{
            backgroundColor: '#fff',
            padding: 10,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onEndEditing={this.handleSearch}
            status="info"
            placeholder="Search"
            style={{
              width: '100%',
              borderRadius: 1,
              borderColor: '#333',
              borderWidth: 1,
              backgroundColor: '#fff',
            }}
            textStyle={{color: '#000'}}
          />
        </View>
      )
    );
  };

  toggleSearch() {
    let flag = this.state.searchHidden;
    this.setState({searchHidden: !flag});
  }

  render() {
    return (
      <Fragment>
        <ModernHeader
          backgroundColor="#1d6ef0"
          text="Wally"
          textStyle={{fontSize: 25, fontStyle: 'italic'}}
          leftDisable="true"
          rightIconName="search"
          rightIconType="MaterialIcons"
          rightIconColor="#f8f7fa"
          rightIconOnPress={event => {
            let flag = this.state.searchHidden;
            if (flag) {
              this.refs.flatListRef.scrollToOffset({animated: true, offset: 0});
            }
            this.toggleSearch(event);
          }}
        />
        <FlatList
          ref="flatListRef"
          ListHeaderComponent={this.renderHeader}
          onEndReached={this.handleScroll}
          style={styles.container}
          data={this.state.images}
          renderItem={({item}) => <Item image={item} />}
          keyExtractor={item => item.id.toString() + uuidv4()}
        />
      </Fragment>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  item: {
    backgroundColor: 'white',
  },
  backdropView: {
    height: 120,
    width: 320,
    backgroundColor: 'rgba(0,0,0,0)',
  },
  headline: {
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0)',
    color: 'white',
  },
});
