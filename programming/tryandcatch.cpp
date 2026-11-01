#include<iostream>
using namespace std;

int main(){
   
    int a,b;
    cin>>a>>b;

    try{
        if(b==0){
        throw b;
        }
        cout<<a<<" / "<<b<<" is "<<(a/b)<<endl;
    }

    catch(int e){
    
        cout<<"exception: there is a division by number "<<e<<endl;
    }
   
    cout<<"exceution continues..."<<endl;
    
    return 0;
}